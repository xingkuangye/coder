import { PauseIcon, PlayIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";

type TaskActionButtonProps = {
	action: "pause" | "resume";
	disabled?: boolean;
	loading?: boolean;
	onClick: () => void;
};

const actionConfig = {
	pause: {
		icon: PauseIcon,
		label: "暂停任务",
		tooltip: "暂停此任务以节省资源，稍后可恢复。",
	},
	resume: {
		icon: PlayIcon,
		label: "恢复任务",
		tooltip: "恢复过程需要时间，因为工作区正在启动中。",
	},
} as const;

export const TaskActionButton: FC<TaskActionButtonProps> = ({
	action,
	disabled,
	loading,
	onClick,
}) => {
	const config = actionConfig[action];
	const Icon = config.icon;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						size="icon-lg"
						variant="outline"
						disabled={disabled || loading}
						onClick={(e) => {
							e.stopPropagation();
							onClick();
						}}
					>
						<Spinner loading={loading}>
							<Icon aria-hidden="true" />
						</Spinner>
						<span className="sr-only">{config.label}</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>{config.tooltip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
