import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { workspaceResolveAutostart } from "#/api/queries/workspaceQuota";
import type {
	Template,
	TemplateVersion,
	Workspace,
	WorkspaceBuild,
} from "#/api/typesGenerated";
import { MemoizedInlineMarkdown } from "#/components/Markdown/InlineMarkdown";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { TemplateUpdateMessage } from "#/modules/templates/TemplateUpdateMessage";

dayjs.extend(relativeTime);

import { useQuery } from "react-query";
import { formatDate } from "#/utils/time";
import type { WorkspacePermissions } from "../../../modules/workspaces/permissions";
import {
	NotificationActionButton,
	type NotificationItem,
	Notifications,
} from "./Notifications";

type WorkspaceNotificationsProps = {
	workspace: Workspace;
	template: Template;
	permissions: WorkspacePermissions;
	onRestartWorkspace: () => void;
	onUpdateWorkspace: () => void;
	onActivateWorkspace: () => void;
	latestVersion?: TemplateVersion;
};

export const WorkspaceNotifications: FC<WorkspaceNotificationsProps> = ({
	workspace,
	template,
	latestVersion,
	permissions,
	onRestartWorkspace,
	onUpdateWorkspace,
	onActivateWorkspace,
}) => {
	const notifications: NotificationItem[] = [];

	// Outdated
	const canAutostartQuery = useQuery(workspaceResolveAutostart(workspace.id));
	const isParameterMismatch =
		canAutostartQuery.data?.parameter_mismatch ?? false;
	const canAutostart = !isParameterMismatch;
	const updateRequired =
		(workspace.template_require_active_version ||
			workspace.automatic_updates === "always") &&
		workspace.outdated;
	const autoStartFailing = workspace.autostart_schedule && !canAutostart;
	const requiresManualUpdate = updateRequired && autoStartFailing;

	if (workspace.outdated && latestVersion) {
		const actions = (
			<NotificationActionButton onClick={onUpdateWorkspace}>
				更新
			</NotificationActionButton>
		);
		if (requiresManualUpdate) {
			notifications.push({
				title: "工作空间的自动启动已被禁用。",
				severity: "warning",
				detail:
					"自动启动无法自动更新你的工作空间。请手动更新工作空间以重新启用自动启动。",

				actions,
			});
		} else {
			notifications.push({
				title: "你的工作空间有可用更新",
				severity: "info",
				detail: (
					<TemplateUpdateMessage>{latestVersion.message}</TemplateUpdateMessage>
				),
				actions,
			});
		}
	}

	// Unhealthy
	if (
		workspace.latest_build.status === "running" &&
		!workspace.health.healthy
	) {
		const troubleshootingURL = findTroubleshootingURL(workspace.latest_build);

		if (isStartupScriptFailure(workspace)) {
			// Restarting won't fix a broken startup script, so omit the Restart
			// button and guide the user to their template admin instead.
			notifications.push({
				title: "启动脚本失败",
				severity: "warning",
				detail:
					"工作空间代理正在运行，但启动脚本以错误退出。",
				actions: troubleshootingURL ? (
					<NotificationActionButton
						onClick={() => window.open(troubleshootingURL, "_blank")}
					>
						故障排除
					</NotificationActionButton>
				) : undefined,
			});
		} else {
			const hasActions = permissions.updateWorkspace || troubleshootingURL;
			notifications.push({
				title: "一个或多个工作空间代理需要注意",
				severity: "warning",
				detail: "展开代理的日志以查看每个代理的健康详细信息。",
				actions: hasActions ? (
					<>
						{permissions.updateWorkspace && (
							<NotificationActionButton onClick={onRestartWorkspace}>
								重启
							</NotificationActionButton>
						)}
						{troubleshootingURL && (
							<NotificationActionButton
								onClick={() => window.open(troubleshootingURL, "_blank")}
							>
								故障排除
							</NotificationActionButton>
						)}
					</>
				) : undefined,
			});
		}
	}

	// Dormant
	const { entitlements } = useDashboard();
	const advancedSchedulingEnabled =
		entitlements.features.advanced_template_scheduling.enabled;
	if (advancedSchedulingEnabled && workspace.dormant_at) {
		const formatDateTime = (dateStr: string, timestamp: boolean): string => {
			const date = new Date(dateStr);
			return formatDate(date, {
				month: "long",
				day: "numeric",
				year: "numeric",
				...(timestamp ? { hour: "numeric", minute: "numeric" } : {}),
			});
		};
		const actions = (
			<NotificationActionButton onClick={onActivateWorkspace}>
				激活
			</NotificationActionButton>
		);
		notifications.push({
			actions,
			title: "工作空间处于休眠状态",
			severity: "warning",
			detail: workspace.deleting_at ? (
				<>
					该工作空间已 {dayjs(workspace.last_used_at).fromNow(true)} 未使用，
					于 {formatDateTime(workspace.dormant_at, false)} 被标记为休眠。
					它计划于 {formatDateTime(workspace.deleting_at, true)} 被删除。
					要保留它，您需要激活工作空间。
				</>
			) : (
				<>
					该工作空间已 {dayjs(workspace.last_used_at).fromNow(true)} 未使用，
					于 {formatDateTime(workspace.dormant_at, false)} 被标记为休眠。
					它未被安排自动删除，但如果在此模板上启用了自动删除，它将成为候选对象。
					要保留它，您需要激活工作空间。
				</>
			),
		});
	}

	// Pending in Queue
	const [showAlertPendingInQueue, setShowAlertPendingInQueue] = useState(false);
	// 2023-11-15 - MES - This effect will be called every single render because
	// "now" will always change and invalidate the dependency array. Need to
	// figure out if this effect really should run every render (possibly meaning
	// no dependency array at all), or how to get the array stabilized (ideal)
	const now = dayjs();
	// biome-ignore lint/correctness/useExhaustiveDependencies: consider refactoring
	useEffect(() => {
		if (
			workspace.latest_build.status !== "pending" ||
			workspace.latest_build.job.queue_size === 0
		) {
			if (!showAlertPendingInQueue) {
				return;
			}

			const hideTimer = setTimeout(() => {
				setShowAlertPendingInQueue(false);
			}, 250);
			return () => {
				clearTimeout(hideTimer);
			};
		}

		const t = Math.max(
			0,
			5000 - dayjs().diff(dayjs(workspace.latest_build.created_at)),
		);
		const showTimer = setTimeout(() => {
			setShowAlertPendingInQueue(true);
		}, t);

		return () => {
			clearTimeout(showTimer);
		};
	}, [workspace, now, showAlertPendingInQueue]);

	if (showAlertPendingInQueue) {
		notifications.push({
			title: "工作空间构建正在排队等待",
			severity: "info",
			detail: (
				<>
					此工作空间构建作业正在等待可用的配置程序。
					如果您已等待较长时间，请联系管理员寻求帮助。
					<span className="block mt-3">
						队列中的位置:{" "}
						<strong>{workspace.latest_build.job.queue_position}</strong>
					</span>
				</>
			),
		});
	}

	// Deprecated
	if (template.deprecated) {
		notifications.push({
			title: "此工作空间使用了已弃用的模板",
			severity: "warning",
			detail: (
				<MemoizedInlineMarkdown>
					{template.deprecation_message}
				</MemoizedInlineMarkdown>
			),
		});
	}

	const infoNotifications = notifications.filter((n) => n.severity === "info");
	const warningNotifications = notifications.filter(
		(n) => n.severity === "warning",
	);

	// We have to avoid rendering out a div at all if there is no content so
	// that we don't introduce additional gaps via the parent flex container
	if (infoNotifications.length === 0 && warningNotifications.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-3">
			{infoNotifications.length > 0 && (
				<Notifications
					items={infoNotifications}
					severity="info"
					icon={<InfoIcon aria-hidden="true" className="size-icon-sm" />}
				/>
			)}

			{warningNotifications.length > 0 && (
				<Notifications
					items={warningNotifications}
					severity="warning"
					icon={
						<TriangleAlertIcon aria-hidden="true" className="size-icon-sm" />
					}
				/>
			)}
		</div>
	);
};

const findTroubleshootingURL = (
	workspaceBuild: WorkspaceBuild,
): string | undefined => {
	for (const resource of workspaceBuild.resources) {
		if (resource.agents) {
			for (const agent of resource.agents) {
				if (agent.troubleshooting_url) {
					return agent.troubleshooting_url;
				}
			}
		}
	}
	return undefined;
};

/**
 * Returns true when every failing agent's lifecycle state is "start_error",
 * meaning the agent process is running but a startup script exited with an
 * error. Restarting the workspace will not fix this because the template admin
 * must correct the startup script.
 */
const isStartupScriptFailure = (workspace: Workspace): boolean => {
	const failingIds = new Set(workspace.health.failing_agents);
	if (failingIds.size === 0) {
		return false;
	}
	for (const resource of workspace.latest_build.resources) {
		for (const agent of resource.agents ?? []) {
			if (failingIds.has(agent.id) && agent.lifecycle_state !== "start_error") {
				return false;
			}
		}
	}
	return true;
};
