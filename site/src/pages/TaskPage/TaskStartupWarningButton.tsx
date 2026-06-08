import { TriangleAlertIcon } from "lucide-react";
import type { FC } from "react";
import type { WorkspaceAgentLifecycle } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Link } from "#/components/Link/Link";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { docs } from "#/utils/docs";

type TaskStartupWarningButtonProps = {
	lifecycleState?: WorkspaceAgentLifecycle | null;
};

export const TaskStartupWarningButton: FC<TaskStartupWarningButtonProps> = ({
	lifecycleState,
}) => {
	switch (lifecycleState) {
		case "start_error":
			return <ErrorScriptButton />;
		case "start_timeout":
			return <TimeoutScriptButton />;
		default:
			return null;
	}
};

type StartupWarningButtonBaseProps = {
	label: string;
	errorMessage: string;
};

const StartupWarningButtonBase: FC<StartupWarningButtonBaseProps> = ({
	label,
	errorMessage,
}) => {
	return (
		<TooltipProvider delayDuration={250}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="border-amber-500 text-amber-600 dark:border-amber-600 dark:text-amber-400"
					>
						<TriangleAlertIcon />
						{label}
					</Button>
				</TooltipTrigger>
				<TooltipContent className="max-w-sm bg-surface-secondary p-4">
					<p className="m-0 text-sm font-normal text-content-primary leading-snug">
						工作区{" "}
						<Link
							href={docs(
								"/admin/templates/troubleshooting#startup-script-exited-with-an-error",
							)}
							target="_blank"
							rel="noreferrer"
						>
							{errorMessage}
						</Link>
						。我们建议{" "}
						<Link
							href={docs(
								"/admin/templates/troubleshooting#startup-script-issues",
							)}
							target="_blank"
							rel="noreferrer"
						>
							调试启动脚本
						</Link>{" "}
						因为{" "}
						<Link
							href={docs(
								"/admin/templates/troubleshooting#your-workspace-may-be-incomplete",
							)}
							target="_blank"
							rel="noreferrer"
						>
							你的工作区可能不完整
						</Link>
						。
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const ErrorScriptButton: FC = () => {
	return (
		<StartupWarningButtonBase
			label="启动错误"
			errorMessage="启动脚本因错误退出"
		/>
	);
};

const TimeoutScriptButton: FC = () => {
	return (
		<StartupWarningButtonBase
			label="启动超时"
			errorMessage="启动脚本超时"
		/>
	);
};
