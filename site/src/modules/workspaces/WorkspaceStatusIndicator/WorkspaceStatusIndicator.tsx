import type React from "react";
import type { FC } from "react";
import type { Workspace } from "#/api/typesGenerated";
import {
	StatusIndicator,
	StatusIndicatorDot,
	type StatusIndicatorProps,
} from "#/components/StatusIndicator/StatusIndicator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import {
	type DisplayWorkspaceStatusType,
	getDisplayWorkspaceStatus,
} from "#/utils/workspace";

const variantByStatusType: Record<
	DisplayWorkspaceStatusType,
	StatusIndicatorProps["variant"]
> = {
	active: "pending",
	inactive: "inactive",
	success: "success",
	error: "failed",
	danger: "warning",
	warning: "warning",
};

type WorkspaceStatusIndicatorProps = {
	workspace: Workspace;
	children?: React.ReactNode;
};

export const WorkspaceStatusIndicator: FC<WorkspaceStatusIndicatorProps> = ({
	workspace,
	children,
}) => {
	let { text, type } = getDisplayWorkspaceStatus(
		workspace.latest_build.status,
		workspace.latest_build.job,
	);

	if (!workspace.health.healthy) {
		type = "warning";
	}

	const statusIndicator = (
		<StatusIndicator variant={variantByStatusType[type]}>
			<StatusIndicatorDot />
			<span className="sr-only">工作区状态：</span> {text}
			{children}
		</StatusIndicator>
	);

	if (workspace.health.healthy) {
		return statusIndicator;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<StatusIndicator variant={variantByStatusType[type]}>
					<StatusIndicatorDot />
					<span className="sr-only">工作区状态：</span> {text}
					{children}
				</StatusIndicator>
			</TooltipTrigger>
			<TooltipContent>
				一个或多个工作区代理需要注意。展开代理日志以查看详情。
			</TooltipContent>
		</Tooltip>
	);
};
