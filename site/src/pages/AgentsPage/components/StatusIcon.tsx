import {
	MonitorDotIcon,
	MonitorIcon,
	MonitorPauseIcon,
	MonitorXIcon,
} from "lucide-react";
import type { FC } from "react";
import type { Workspace, WorkspaceAgent } from "#/api/typesGenerated";
import {
	type DisplayWorkspaceStatusType,
	getDisplayWorkspaceStatus,
} from "#/utils/workspace";

const iconMap: Record<
	DisplayWorkspaceStatusType,
	FC<{ className?: string }>
> = {
	success: MonitorIcon,
	active: MonitorDotIcon,
	inactive: MonitorPauseIcon,
	error: MonitorXIcon,
	danger: MonitorXIcon,
	warning: MonitorXIcon,
};

export const StatusIcon: FC<{
	type: DisplayWorkspaceStatusType;
	className?: string;
}> = ({ type, className = "size-3" }) => {
	const Icon = iconMap[type];
	return <Icon className={className} />;
};

export function getWorkspaceStatus(
	workspace: Workspace,
	agent?: WorkspaceAgent | null,
): { effectiveType: DisplayWorkspaceStatusType; statusLabel: string } {
	let { type, text } = getDisplayWorkspaceStatus(
		workspace.latest_build.status,
		workspace.latest_build.job,
	);

	const agentPreparing =
		workspace.latest_build.status === "running" &&
		(agent?.lifecycle_state === "created" ||
			agent?.lifecycle_state === "starting");
	const agentStartupFailed =
		workspace.latest_build.status === "running" &&
		(agent?.lifecycle_state === "start_error" ||
			agent?.lifecycle_state === "start_timeout");
	if (agentPreparing) {
		type = "active";
		text = "准备中";
	} else if (agentStartupFailed) {
		type = "warning";
		text = "启动失败";
	}

	const effectiveType = workspace.health.healthy ? type : "warning";
	const statusLabel = workspace.health.healthy
		? `工作区 ${text.toLowerCase()}`
		: `工作区 ${text.toLowerCase()}（不健康）`;
	return { effectiveType, statusLabel };
}
