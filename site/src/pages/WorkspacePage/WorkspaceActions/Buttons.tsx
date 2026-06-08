import {
	BanIcon,
	CloudIcon,
	PlayIcon,
	PowerIcon,
	RotateCcwIcon,
	SquareIcon,
	StarIcon,
	StarOffIcon,
} from "lucide-react";
import type { FC } from "react";
import type { Workspace, WorkspaceBuildParameter } from "#/api/typesGenerated";
import { TopbarButton } from "#/components/FullPageLayout/Topbar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { BuildParametersPopover } from "./BuildParametersPopover";

export interface ActionButtonProps {
	loading?: boolean;
	handleAction: (buildParameters?: WorkspaceBuildParameter[]) => void;
	disabled?: boolean;
	tooltipText?: string;
	isRunning?: boolean;
	requireActiveVersion?: boolean;
}

export const UpdateButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
	isRunning,
	requireActiveVersion,
}) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<TopbarButton
					data-testid="workspace-update-button"
					disabled={loading}
					onClick={() => handleAction()}
				>
					{requireActiveVersion ? <PlayIcon /> : <CloudIcon />}
					{loading ? (
						<>更新中&hellip;</>
					) : isRunning ? (
						<>更新并重启&hellip;</>
					) : (
						<>更新并启动&hellip;</>
					)}
				</TopbarButton>
			</TooltipTrigger>
			<TooltipContent side="bottom" className="max-w-xs">
				{requireActiveVersion
					? "此模板要求工作区启动时自动更新。若要保留模板版本，请联系您的管理员。"
					: isRunning
						? "停止工作区并使用最新模板版本重启。"
						: "使用最新模板版本启动工作区。"}
			</TooltipContent>
		</Tooltip>
	);
};

export const ActivateButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
}) => {
	return (
		<TopbarButton disabled={loading} onClick={() => handleAction()}>
			<PowerIcon />
			{loading ? <>激活中&hellip;</> : "激活"}
		</TopbarButton>
	);
};

interface ActionButtonPropsWithWorkspace extends ActionButtonProps {
	workspace: Workspace;
}

export const StartButton: FC<ActionButtonPropsWithWorkspace> = ({
	handleAction,
	workspace,
	loading,
	disabled,
	tooltipText,
}) => {
	let mainButton = (
		<TopbarButton
			data-testid="workspace-start"
			onClick={() => handleAction()}
			disabled={disabled || loading}
		>
			<PlayIcon />
			{loading ? <>启动中&hellip;</> : "启动"}
		</TopbarButton>
	);

	if (tooltipText) {
		mainButton = (
			<Tooltip>
				<TooltipTrigger asChild>{mainButton}</TooltipTrigger>
				<TooltipContent side="bottom" className="max-w-xs">
					{tooltipText}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<div className="flex gap-1 items-center">
			{mainButton}
			<BuildParametersPopover
				label="使用构建参数启动"
				workspace={workspace}
				disabled={loading}
				onSubmit={handleAction}
			/>
		</div>
	);
};

export const StopButton: FC<ActionButtonProps> = ({
	handleAction,
	loading,
}) => {
	return (
		<TopbarButton
			disabled={loading}
			onClick={() => handleAction()}
			data-testid="workspace-stop-button"
		>
			<SquareIcon />
			{loading ? <>停止中&hellip;</> : "停止"}
		</TopbarButton>
	);
};

export const RestartButton: FC<ActionButtonPropsWithWorkspace> = ({
	handleAction,
	loading,
	workspace,
}) => {
	return (
		<div className="flex gap-1 items-center">
			<TopbarButton
				onClick={() => handleAction()}
				data-testid="workspace-restart-button"
				disabled={loading}
			>
				<RotateCcwIcon />
				{loading ? <>重启中&hellip;</> : <>重启&hellip;</>}
			</TopbarButton>
			<BuildParametersPopover
				label="使用构建参数重启"
				workspace={workspace}
				disabled={loading}
				onSubmit={handleAction}
			/>
		</div>
	);
};

export const CancelButton: FC<ActionButtonProps> = ({ handleAction }) => {
	return (
		<TopbarButton onClick={() => handleAction()}>
			<BanIcon />
			取消
		</TopbarButton>
	);
};

interface DisabledButtonProps {
	label: string;
}

export const DisabledButton: FC<DisabledButtonProps> = ({ label }) => {
	return (
		<TopbarButton disabled>
			<BanIcon />
			{label}
		</TopbarButton>
	);
};

interface FavoriteButtonProps {
	onToggle: (workspaceID: string) => void;
	workspaceID: string;
	isFavorite: boolean;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
	onToggle,
	workspaceID,
	isFavorite,
}) => {
	return (
		<TopbarButton onClick={() => onToggle(workspaceID)}>
			{isFavorite ? <StarOffIcon /> : <StarIcon />}
			{isFavorite ? "取消收藏" : "收藏"}
		</TopbarButton>
	);
};
