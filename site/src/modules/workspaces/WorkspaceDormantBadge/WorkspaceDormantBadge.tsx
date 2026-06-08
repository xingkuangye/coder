import type { FC } from "react";
import type { Workspace } from "#/api/typesGenerated";
import { Badge } from "#/components/Badge/Badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import {
	DATE_FORMAT,
	formatDateTime,
	relativeTimeWithoutSuffix,
} from "#/utils/time";

type WorkspaceDormantBadgeProps = {
	workspace: Workspace;
};

export const WorkspaceDormantBadge: FC<WorkspaceDormantBadgeProps> = ({
	workspace,
}) => {
	return workspace.deleting_at ? (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge role="status" variant="destructive" size="xs">
					等待删除
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				此工作空间已{" "}
				{relativeTimeWithoutSuffix(workspace.last_used_at)} 未使用，并被标记为休眠。它计划于{" "}
				{formatDateTime(workspace.deleting_at, DATE_FORMAT.FULL_DATETIME)} 删除。
			</TooltipContent>
		</Tooltip>
	) : (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge role="status" variant="warning" size="xs">
					休眠
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				此工作空间已{" "}
				{relativeTimeWithoutSuffix(workspace.last_used_at)} 未使用，并被标记为休眠。它目前未计划自动删除，但如果在此模板上启用了自动删除，它将成为候选。
			</TooltipContent>
		</Tooltip>
	);
};
