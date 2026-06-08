import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import minMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import {
	CircleAlertIcon,
	HourglassIcon,
	PlayIcon,
	SquareIcon,
} from "lucide-react";
import semver from "semver";
import type * as TypesGen from "#/api/typesGenerated";
import { PillSpinner } from "#/components/Pill/Pill";
import { getPendingStatusLabel } from "./provisionerJob";

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(minMax);

const DisplayAgentVersionLanguage = {
	unknown: "未知",
};

export const getDisplayWorkspaceBuildInitiatedBy = (
	build: TypesGen.WorkspaceBuild,
): string | undefined => {
	switch (build.reason) {
		case "initiator":
		case "dashboard":
		case "cli":
		case "ssh_connection":
		case "vscode_connection":
		case "jetbrains_connection":
		case "task_manual_pause":
		case "task_resume":
			return build.initiator_name;
		case "autostart":
		case "autostop":
		case "dormancy":
		case "task_auto_pause":
			return "Coder";
	}
	return undefined;
};

export const systemBuildReasons = [
	"autostart",
	"autostop",
	"dormancy",
	"task_auto_pause",
	"task_manual_pause",
	"task_resume",
];

export const buildReasonLabels: Record<TypesGen.BuildReason, string> = {
	// User build reasons
	initiator: "API",
	dashboard: "仪表板",
	cli: "CLI",
	ssh_connection: "SSH 连接",
	vscode_connection: "VSCode 连接",
	jetbrains_connection: "JetBrains 连接",

	// System build reasons
	autostart: "自动启动",
	autostop: "自动停止",
	dormancy: "休眠",
	task_auto_pause: "任务自动暂停",
	task_manual_pause: "任务手动暂停",
	task_resume: "任务恢复",
};

const getWorkspaceBuildDurationInSeconds = (
	build: TypesGen.WorkspaceBuild,
): number | undefined => {
	const isCompleted = build.job.started_at && build.job.completed_at;

	if (!isCompleted) {
		return;
	}

	const startedAt = dayjs(build.job.started_at);
	const completedAt = dayjs(build.job.completed_at);
	return completedAt.diff(startedAt, "seconds");
};

export const displayWorkspaceBuildDuration = (
	build: TypesGen.WorkspaceBuild,
	inProgressLabel = "进行中",
): string => {
	const duration = getWorkspaceBuildDurationInSeconds(build);
	return duration ? `${duration} 秒` : inProgressLabel;
};

export enum agentVersionStatus {
	Updated = 1,
	Outdated = 2,
	Deprecated = 3,
}

export const getDisplayVersionStatus = (
	agentVersion: string,
	serverVersion: string,
	agentAPIVersion: string,
	serverAPIVersion: string,
): { displayVersion: string; status: agentVersionStatus } => {
	// APIVersions only have major.minor so coerce them to major.minor.0, so we can use semver.major()
	const a = semver.coerce(agentAPIVersion);
	const s = semver.coerce(serverAPIVersion);
	let status = agentVersionStatus.Updated;
	if (
		semver.valid(agentVersion) &&
		semver.valid(serverVersion) &&
		semver.lt(agentVersion, serverVersion)
	) {
		status = agentVersionStatus.Outdated;
	}
	// deprecated overrides and implies Outdated
	if (a !== null && s !== null && semver.major(a) < semver.major(s)) {
		status = agentVersionStatus.Deprecated;
	}
	const displayVersion = agentVersion || DisplayAgentVersionLanguage.unknown;
	return {
		displayVersion: displayVersion,
		status: status,
	};
};

export const isWorkspaceOn = (workspace: TypesGen.Workspace): boolean => {
	const transition = workspace.latest_build.transition;
	const status = workspace.latest_build.job.status;
	return transition === "start" && status === "succeeded";
};

export const defaultWorkspaceExtension = (
	__startDate?: dayjs.Dayjs,
): TypesGen.PutExtendWorkspaceRequest => {
	const now = __startDate ? dayjs(__startDate) : dayjs();
	const fourHoursFromNow = now.add(4, "hours").utc();

	return {
		deadline: fourHoursFromNow.format(),
	};
};

export const getDisplayWorkspaceTemplateName = (
	workspace: TypesGen.Workspace,
): string => {
	return workspace.template_display_name.length > 0
		? workspace.template_display_name
		: workspace.template_name;
};

export type DisplayWorkspaceStatusType =
	| "success"
	| "active"
	| "inactive"
	| "error"
	| "warning"
	| "danger";

type DisplayWorkspaceStatus = {
	text: string;
	type: DisplayWorkspaceStatusType;
	icon: React.ReactNode;
};

export const getDisplayWorkspaceStatus = (
	workspaceStatus: TypesGen.WorkspaceStatus,
	provisionerJob?: TypesGen.ProvisionerJob,
): DisplayWorkspaceStatus => {
	switch (workspaceStatus) {
		case undefined:
			return {
				text: "加载中",
				type: "active",
				icon: <PillSpinner />,
			} as const;
		case "running":
			return {
				type: "success",
				text: "运行中",
				icon: <PlayIcon />,
			} as const;
		case "starting":
			return {
				type: "active",
				text: "启动中",
				icon: <PillSpinner />,
			} as const;
		case "stopping":
			return {
				type: "inactive",
				text: "停止中",
				icon: <PillSpinner />,
			} as const;
		case "stopped":
			return {
				type: "inactive",
				text: "已停止",
				icon: <SquareIcon />,
			} as const;
		case "deleting":
			return {
				type: "danger",
				text: "删除中",
				icon: <PillSpinner />,
			} as const;
		case "deleted":
			return {
				type: "danger",
				text: "已删除",
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "canceling":
			return {
				type: "inactive",
				text: "取消中",
				icon: <PillSpinner />,
			} as const;
		case "canceled":
			return {
				type: "inactive",
				text: "已取消",
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "failed":
			return {
				type: "error",
				text: "失败",
				icon: <CircleAlertIcon aria-hidden="true" className="size-icon-sm" />,
			} as const;
		case "pending":
			return {
				type: "active",
				text: getPendingStatusLabel(provisionerJob),
				icon: <HourglassIcon className="size-icon-sm" />,
			} as const;
	}
};

export const getMatchingAgentOrFirst = (
	workspace: TypesGen.Workspace,
	agentName: string | undefined,
): TypesGen.WorkspaceAgent | undefined => {
	return workspace.latest_build.resources
		.map((resource) => {
			if (!resource.agents || resource.agents.length === 0) {
				return;
			}
			if (!agentName) {
				return resource.agents[0];
			}
			return resource.agents.find((agent) => agent.name === agentName);
		})
		.filter((a) => a)[0];
};

export const mustUpdateWorkspace = (
	workspace: TypesGen.Workspace,
	canChangeVersions: boolean,
): boolean => {
	return (
		workspaceUpdatePolicy(workspace, canChangeVersions) === "always" &&
		workspace.outdated
	);
};

const workspaceUpdatePolicy = (
	workspace: TypesGen.Workspace,
	canChangeVersions: boolean,
): TypesGen.AutomaticUpdates => {
	// If a template requires the active version and you cannot change versions
	// (restricted to template admins), then your policy must be "Always".
	if (workspace.template_require_active_version && !canChangeVersions) {
		return "always";
	}
	return workspace.automatic_updates;
};

// These resources (i.e. docker_image, kubernetes_deployment) map to Terraform
// resource types. These are the most used ones and are based on user usage.
// We may want to update from time-to-time.
const BUILT_IN_ICON_PATHS: Record<string, `/icon/${string}`> = {
	docker_volume: "/icon/database.svg",
	docker_container: "/icon/memory.svg",
	docker_image: "/icon/container.svg",
	kubernetes_persistent_volume_claim: "/icon/database.svg",
	kubernetes_pod: "/icon/memory.svg",
	google_compute_disk: "/icon/database.svg",
	google_compute_instance: "/icon/memory.svg",
	aws_instance: "/icon/memory.svg",
	kubernetes_deployment: "/icon/memory.svg",
};
const FALLBACK_ICON = "/icon/widgets.svg";

export const getResourceIconPath = (resourceType: string): string => {
	return BUILT_IN_ICON_PATHS[resourceType] ?? FALLBACK_ICON;
};

export const lastUsedMessage = (lastUsedAt: string | Date): string => {
	const t = dayjs(lastUsedAt);
	const now = dayjs();
	let message = t.fromNow();

	if (t.isAfter(now.subtract(1, "hour"))) {
		message = "刚刚";
	} else if (t.isAfter(now.subtract(3, "day"))) {
		message = t.fromNow();
	} else if (t.isAfter(now.subtract(1, "month"))) {
		message = t.fromNow();
	} else if (t.isAfter(now.subtract(100, "year"))) {
		message = t.fromNow();
	} else {
		message = "从不";
	}

	return message;
};
