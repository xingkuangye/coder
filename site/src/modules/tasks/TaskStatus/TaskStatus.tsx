import type { FC } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import {
	StatusIndicator,
	StatusIndicatorDot,
	type StatusIndicatorProps,
} from "#/components/StatusIndicator/StatusIndicator";

type TaskStatusProps = {
	status: TypesGen.TaskStatus;
	stateMessage: string;
};

export const taskStatusToStatusIndicatorVariant: Record<
	TypesGen.TaskStatus,
	StatusIndicatorProps["variant"]
> = {
	active: "success",
	error: "failed",
	initializing: "pending",
	pending: "pending",
	paused: "inactive",
	unknown: "warning",
};

export const taskStatusToDisplayText: Record<TypesGen.TaskStatus, string> = {
	active: "活跃",
	error: "错误",
	initializing: "初始化中",
	pending: "待处理",
	paused: "已暂停",
	unknown: "未知",
};

export const TaskStatus: FC<TaskStatusProps> = ({ status, stateMessage }) => {
	return (
		<StatusIndicator
			variant={taskStatusToStatusIndicatorVariant[status]}
			className="items-start"
		>
			<StatusIndicatorDot className="mt-1" />
			<div className="flex flex-col">
				<span className="[&:first-letter]:uppercase">
					{taskStatusToDisplayText[status]}
				</span>
				<span className="text-xs font-normal text-content-secondary truncate max-w-sm">
					{stateMessage}
				</span>
			</div>
		</StatusIndicator>
	);
};
