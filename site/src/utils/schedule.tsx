import Link from "@mui/material/Link";
import cronParser from "cron-parser";
import cronstrue from "cronstrue";
import dayjs, { type Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import type { Template, Workspace } from "#/api/typesGenerated";
import { HelpPopoverTitle } from "#/components/HelpPopover/HelpPopover";
import type { WorkspaceActivityStatus } from "#/modules/workspaces/activity";
import { isWorkspaceOn } from "./workspace";

// REMARK: some plugins depend on utc, so it's listed first. Otherwise they're
//         sorted alphabetically.
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
/**
 * @fileoverview 客户端对应项，对应于 coderd/autostart/schedule Go 包。此包是 crontab 的变体，使用分钟、小时和星期几。
 */

/**
 * DEFAULT_TIMEZONE is the default timezone that crontab assumes unless one is
 * specified.
 */
const DEFAULT_TIMEZONE = "UTC";

/**
 * stripTimezone strips a leading timezone from a schedule string
 */
export const stripTimezone = (raw: string): string => {
	return raw.replace(/CRON_TZ=\S*\s/, "");
};

/**
 * extractTimezone returns a leading timezone from a schedule string if one is
 * specified; otherwise the specified defaultTZ
 */
export const extractTimezone = (
	raw: string,
	defaultTZ = DEFAULT_TIMEZONE,
): string => {
	const matches = raw.match(/CRON_TZ=\S*\s/g);

	if (matches && matches.length > 0) {
		return matches[0].replace(/CRON_TZ=/, "").trim();
	}
	return defaultTZ;
};

export const autostartDisplay = (schedule: string | undefined): string => {
	if (schedule) {
		return (
			cronstrue
				.toString(stripTimezone(schedule), {
					throwExceptionOnParseError: false,
				})
				// We don't want to keep the At because it is on the label
				.replace("At", "")
		);
	}
	return "手动";
};

const isShuttingDown = (workspace: Workspace, deadline?: Dayjs): boolean => {
	if (!deadline) {
		if (!workspace.latest_build.deadline) {
			return false;
		}
		deadline = dayjs(workspace.latest_build.deadline).utc();
	}
	const now = dayjs().utc();
	return isWorkspaceOn(workspace) && now.isAfter(deadline);
};

export const autostopDisplay = (
	workspace: Workspace,
	activityStatus: WorkspaceActivityStatus,
	template: Template,
): {
	message: ReactNode;
	tooltip?: ReactNode;
	danger?: boolean;
} => {
	const ttl = workspace.ttl_ms;

	if (isWorkspaceOn(workspace) && workspace.latest_build.deadline) {
		// Workspace is on --> derive from latest_build.deadline. Note that the
		// user may modify their workspace object (ttl) while the workspace is
		// running and depending on system semantics, the deadline may still
		// represent the previously defined ttl. Thus, we always derive from the
		// deadline as the source of truth.

		const deadline = dayjs(workspace.latest_build.deadline).tz(
			dayjs.tz.guess(),
		);
		const now = dayjs(workspace.latest_build.deadline);

		if (activityStatus === "connected") {
			const hasMaxDeadline = Boolean(workspace.latest_build.max_deadline);
			const maxDeadline = dayjs(workspace.latest_build.max_deadline);
			if (hasMaxDeadline && maxDeadline.isBefore(now.add(2, "hour"))) {
				return {
					message: "需要立即停止",
					tooltip: (
						<>
							<HelpPopoverTitle>即将需要停止</HelpPopoverTitle>
							此工作区需要在{" "}
							{dayjs(workspace.latest_build.max_deadline).format(
								"MMMM D [at] h:mm A",
							)}
							前停止。您可以在此之前重启工作区以避免中断。
						</>
					),
					danger: true,
				};
			}
		}

		if (isShuttingDown(workspace, deadline)) {
			return {
				message: "工作区正在关闭",
			};
		}
		let title = (
			<HelpPopoverTitle>模板自动停止需求</HelpPopoverTitle>
		);
		let reason: ReactNode = ` 因为 ${template.display_name} 模板有自动停止需求。`;
		if (template.autostop_requirement && template.allow_user_autostop) {
			title = <HelpPopoverTitle>自动停止计划</HelpPopoverTitle>;
			reason = (
				<span data-chromatic="ignore">
					{" "}
					因为此工作区已启用自动停止。您可以通过此工作区的{" "}
					<Link component={RouterLink} to="settings/schedule">
						计划设置
					</Link>
					{" "}来禁用自动停止。
				</span>
			);
		}
		return {
			message: `停止 ${deadline.fromNow()}`,
			tooltip: (
				<span data-chromatic="ignore">
					{title}
					此工作区将于{" "}
					{deadline.format("MMMM D [at] h:mm A")}
					{reason}
				</span>
			),
			danger: isShutdownSoon(workspace),
		};
	}
	if (!ttl || ttl < 1) {
		// If the workspace is not on, and the ttl is 0 or undefined, then the
		// workspace is set to manually shutdown.
		return {
			message: "手动",
		};
	}
	// The workspace has a ttl set, but is either in an unknown state or is
	// not running. Therefore, we derive from workspace.ttl.
	const duration = dayjs.duration(ttl, "milliseconds");
	return {
		message: `启动 ${duration.humanize()} 后停止`,
	};
};

const isShutdownSoon = (workspace: Workspace): boolean => {
	const deadline = workspace.latest_build.deadline;
	if (!deadline) {
		return false;
	}
	const deadlineDate = new Date(deadline);
	const now = new Date();
	const diff = deadlineDate.getTime() - now.getTime();
	const oneHour = 1000 * 60 * 60;
	return diff < oneHour;
};

export const deadlineExtensionMin = dayjs.duration(30, "minutes");
export const deadlineExtensionMax = dayjs.duration(24, "hours");

/**
 * Depends on the time the workspace was last updated and a global constant.
 * @param ws workspace
 * @returns the latest datetime at which the workspace can be automatically shut down.
 */
export function getMaxDeadline(ws: Workspace | undefined): dayjs.Dayjs {
	// note: we count runtime from updated_at as started_at counts from the start of
	// the workspace build process, which can take a while.
	if (ws === undefined) {
		throw Error("Cannot calculate max deadline because workspace is undefined");
	}
	const startedAt = dayjs(ws.latest_build.updated_at);
	return startedAt.add(deadlineExtensionMax);
}

/**
 * Depends on the current time and a global constant.
 * @returns the earliest datetime at which the workspace can be automatically shut down.
 */
export function getMinDeadline(): dayjs.Dayjs {
	return dayjs().add(deadlineExtensionMin);
}

export const getDeadline = (workspace: Workspace): dayjs.Dayjs =>
	dayjs(workspace.latest_build.deadline).utc();

/**
 * Get number of hours you can add or subtract to the current deadline before hitting the max or min deadline.
 * @param deadline
 * @param workspace
 * @returns number, in hours
 */
export const getMaxDeadlineChange = (
	deadline: dayjs.Dayjs,
	extremeDeadline: dayjs.Dayjs,
): number => Math.abs(deadline.diff(extremeDeadline, "hours"));

export const validTime = (time: string): boolean => {
	return /^[0-9][0-9]:[0-9][0-9]$/.test(time);
};

export const timeToCron = (time: string, tz?: string) => {
	if (!validTime(time)) {
		throw new Error(`无效时间: ${time}`);
	}
	const [HH, mm] = time.split(":");
	let prefix = "";
	if (tz) {
		prefix = `CRON_TZ=${tz} `;
	}
	return `${prefix}${Number(mm)} ${Number(HH)} * * *`;
};

export const quietHoursDisplay = (
	browserLocale: string,
	time: string,
	tz: string,
	now: Date | undefined,
): string => {
	if (!validTime(time)) {
		return "无效时间";
	}

	// The cron-parser package doesn't accept a timezone in the cron string, but
	// accepts it as an option.
	const cron = timeToCron(time);
	const parsed = cronParser.parseExpression(cron, {
		currentDate: now,
		iterator: false,
		utc: false,
		tz,
	});

	const today = dayjs(now).tz(tz);
	const day = dayjs(parsed.next().toDate()).tz(tz);

	const formattedTime = new Intl.DateTimeFormat(browserLocale, {
		hour: "numeric",
		minute: "numeric",
		timeZone: tz,
	}).format(day.toDate());

	let display = formattedTime;

	if (day.isSame(today, "day")) {
		display += " 今天";
	} else if (day.isSame(today.add(1, "day"), "day")) {
		display += " 明天";
	} else {
		// This case will rarely ever be hit, as we're dealing with only times and
		// not dates, but it can be hit due to mismatched browser timezone to cron
		// timezone or due to daylight savings changes.
		display += ` 于 ${day.format("dddd, MMMM D")}`;
	}

	display += ` (${day.from(today)}) 于 ${tz}`;

	return display;
};

export type TemplateAutostartRequirementDaysValue =
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday"
	| "sunday";

export type TemplateAutostopRequirementDaysValue =
	| "off"
	| "daily"
	| "saturday"
	| "sunday";

export const sortedDays = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
] as TemplateAutostartRequirementDaysValue[];

export const calculateAutostopRequirementDaysValue = (
	value: TemplateAutostopRequirementDaysValue,
): Template["autostop_requirement"]["days_of_week"] => {
	switch (value) {
		case "daily":
			return [
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
				"sunday",
			];
		case "saturday":
			return ["saturday"];
		case "sunday":
			return ["sunday"];
	}

	return [];
};
