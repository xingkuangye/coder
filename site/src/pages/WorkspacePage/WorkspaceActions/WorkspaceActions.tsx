import { type FC, Fragment, type ReactNode } from "react";
import { useQuery } from "react-query";
import { deploymentConfig } from "#/api/queries/deployment";
import type { Workspace, WorkspaceBuildParameter } from "#/api/typesGenerated";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import {
	type ActionType,
	abilitiesByWorkspaceStatus,
} from "#/modules/workspaces/actions";
import type { WorkspacePermissions } from "#/modules/workspaces/permissions";
import { WorkspaceMoreActions } from "#/modules/workspaces/WorkspaceMoreActions/WorkspaceMoreActions";
import { mustUpdateWorkspace } from "#/utils/workspace";
import {
	ActivateButton,
	CancelButton,
	DisabledButton,
	FavoriteButton,
	RestartButton,
	StartButton,
	StopButton,
	UpdateButton,
} from "./Buttons";
import { DebugButton } from "./DebugButton";
import { RetryButton } from "./RetryButton";
import { ShareButton } from "./ShareButton";

interface WorkspaceActionsProps {
	workspace: Workspace;
	isUpdating: boolean;
	isRestarting: boolean;
	permissions: WorkspacePermissions;
	handleToggleFavorite: () => void;
	handleStart: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleStop: () => void;
	handleRestart: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleUpdate: () => void;
	handleCancel: () => void;
	handleRetry: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleDebug: (buildParameters?: WorkspaceBuildParameter[]) => void;
	handleDormantActivate: () => void;
}

export const WorkspaceActions: FC<WorkspaceActionsProps> = ({
	workspace,
	isUpdating,
	isRestarting,
	permissions,
	handleToggleFavorite,
	handleStart,
	handleStop,
	handleRestart,
	handleUpdate,
	handleCancel,
	handleRetry,
	handleDebug,
	handleDormantActivate,
}) => {
	const {
		permissions: { viewDeploymentConfig },
		user,
	} = useAuthenticated();
	const { data: deployment } = useQuery({
		...deploymentConfig(),
		enabled: viewDeploymentConfig,
	});
	const { actions, canCancel, canAcceptJobs } = abilitiesByWorkspaceStatus(
		workspace,
		{
			canDebug: Boolean(deployment?.config.enable_terraform_debug_mode),
			isOwner: user.roles.some((role) => role.name === "owner"),
		},
	);

	const mustUpdate = mustUpdateWorkspace(
		workspace,
		permissions.updateWorkspaceVersion,
	);
	const tooltipText = getTooltipText(
		workspace,
		mustUpdate,
		permissions.updateWorkspaceVersion,
	);

	// A mapping of button type to the corresponding React component
	const buttonMapping: Record<ActionType, ReactNode> = {
		updateAndStart: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={false}
				requireActiveVersion={false}
			/>
		),
		updateAndStartRequireActiveVersion: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning={false}
				requireActiveVersion
			/>
		),
		updateAndRestart: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning
				requireActiveVersion={false}
			/>
		),
		updateAndRestartRequireActiveVersion: (
			<UpdateButton
				handleAction={handleUpdate}
				isRunning
				requireActiveVersion
			/>
		),
		updating: <UpdateButton loading handleAction={handleUpdate} />,
		start: (
			<StartButton
				workspace={workspace}
				handleAction={handleStart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		starting: (
			<StartButton
				loading
				workspace={workspace}
				handleAction={handleStart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		stop: <StopButton handleAction={handleStop} />,
		stopping: <StopButton loading handleAction={handleStop} />,
		restart: (
			<RestartButton
				workspace={workspace}
				handleAction={handleRestart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		restarting: (
			<RestartButton
				loading
				workspace={workspace}
				handleAction={handleRestart}
				disabled={mustUpdate}
				tooltipText={tooltipText}
			/>
		),
		deleting: <DisabledButton label="正在删除" />,
		canceling: <DisabledButton label="正在取消..." />,
		deleted: <DisabledButton label="已删除" />,
		pending: <DisabledButton label="等待中..." />,
		activate: <ActivateButton handleAction={handleDormantActivate} />,
		activating: <ActivateButton loading handleAction={handleDormantActivate} />,
		retry: (
			<RetryButton
				handleAction={handleRetry}
				workspace={workspace}
				enableBuildParameters={workspace.latest_build.transition === "start"}
			/>
		),
		debug: (
			<DebugButton
				handleAction={handleDebug}
				workspace={workspace}
				enableBuildParameters={workspace.latest_build.transition === "start"}
			/>
		),
	};

	return (
		<div className="flex items-center gap-2" data-testid="workspace-actions">
			{/* Restarting must be handled separately, because it otherwise would appear as stopping */}
			{isUpdating
				? buttonMapping.updating
				: isRestarting
					? buttonMapping.restarting
					: actions.map((action) => (
							<Fragment key={action}>{buttonMapping[action]}</Fragment>
						))}

			{canCancel && <CancelButton handleAction={handleCancel} />}

			<FavoriteButton
				workspaceID={workspace.id}
				isFavorite={workspace.favorite}
				onToggle={handleToggleFavorite}
			/>

			{permissions.shareWorkspace && (
				<ShareButton
					workspace={workspace}
					canUpdatePermissions={permissions.updateWorkspace}
				/>
			)}

			<WorkspaceMoreActions workspace={workspace} disabled={!canAcceptJobs} />
		</div>
	);
};

function getTooltipText(
	workspace: Workspace,
	mustUpdate: boolean,
	canChangeVersions: boolean,
): string {
	if (!mustUpdate && !canChangeVersions) {
		return "";
	}

	if (
		!mustUpdate &&
		canChangeVersions &&
		workspace.template_require_active_version
	) {
		return "此模板要求在工作区启动时自动更新，但模板管理员可以忽略此策略。";
	}

	if (workspace.automatic_updates === "always") {
		return "此工作区已启用自动更新。如果想保留模板版本，请在工作区设置中修改更新策略。";
	}

	return "";
}
