import type { Interpolation, Theme } from "@emotion/react";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import { type FC, type FormEvent, useId, useState } from "react";
import type {
	CreateWorkspaceBuildRequest,
	Workspace,
} from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { docs } from "#/utils/docs";

interface WorkspaceDeleteDialogProps {
	workspace: Workspace;
	canDeleteFailedWorkspace: boolean;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: (arg: CreateWorkspaceBuildRequest["orphan"]) => void;
}

export const WorkspaceDeleteDialog: FC<WorkspaceDeleteDialogProps> = ({
	workspace,
	canDeleteFailedWorkspace,
	isOpen,
	onCancel,
	onConfirm,
}) => {
	const hookId = useId();
	const [userConfirmationText, setUserConfirmationText] = useState("");
	const [orphanWorkspace, setOrphanWorkspace] =
		useState<CreateWorkspaceBuildRequest["orphan"]>(false);
	const [isFocused, setIsFocused] = useState(false);

	const deletionConfirmed = workspace.name === userConfirmationText;
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		if (deletionConfirmed) {
			onConfirm(orphanWorkspace);
		}
	};

	const hasError = !deletionConfirmed && userConfirmationText.length > 0;
	const displayErrorMessage = hasError && !isFocused;
	const inputColor = hasError ? "error" : "primary";
	// Orphaning is sort of a "last resort" that should really only
	// be used under the following circumstances:
	// a) Terraform is failing to apply while deleting, which
	//    usually means that builds are failing as well.
	// b) No provisioner is available to delete the workspace, which will
	//    cause the job to remain in the "pending" state indefinitely.
	//    The assumption here is that an admin will cancel the job, in which
	//    case we want to allow them to perform an orphan-delete.
	const canOrphan =
		canDeleteFailedWorkspace &&
		(workspace.latest_build.status === "failed" ||
			workspace.latest_build.status === "canceled");

	const hasTask = Boolean(workspace.task_id);

	return (
		<ConfirmDialog
			type="delete"
			hideCancel={false}
			open={isOpen}
			title="删除工作区"
			onConfirm={() => onConfirm(orphanWorkspace)}
			onClose={onCancel}
			disabled={!deletionConfirmed}
			description={
				<>
					<div css={styles.workspaceInfo}>
						<div>
							<p className="name">{workspace.name}</p>
							<p className="label">工作区</p>
						</div>
						<div className="text-right">
							<p className="info">{dayjs(workspace.created_at).fromNow()}</p>
							<p className="label">创建时间</p>
						</div>
					</div>

					<p>删除此工作区是不可逆的！</p>
					<p>
						在下方键入&ldquo;<strong>{workspace.name}</strong>&rdquo;以确认：
					</p>

					<form onSubmit={onSubmit}>
						<TextField
							fullWidth
							autoFocus
							className="mt-8"
							name="confirmation"
							autoComplete="off"
							id={`${hookId}-confirm`}
							placeholder={workspace.name}
							value={userConfirmationText}
							onChange={(event) => setUserConfirmationText(event.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							label="工作区名称"
							color={inputColor}
							error={displayErrorMessage}
							helperText={
								displayErrorMessage &&
								`${userConfirmationText} 与此工作区名称不匹配`
							}
							InputProps={{ color: inputColor }}
							inputProps={{
								"data-testid": "delete-dialog-name-confirmation",
							}}
						/>
						{hasTask && (
							<div css={styles.warnContainer}>
								<div className="flex-col">
									<p className="info">此工作区与一个任务关联</p>
									<span className="text-xs mt-1 block">
										删除此工作区也将删除{" "}
										<Link
											href={`/tasks/${workspace.owner_name}/${workspace.task_id}`}
										>
											此任务
										</Link>
										。
									</span>
								</div>
							</div>
						)}
						{canOrphan && (
							<div css={styles.warnContainer}>
								<div className="flex-col">
									<Checkbox
										id="orphan_resources"
										size="small"
										color="warning"
										onChange={() => {
											setOrphanWorkspace(!orphanWorkspace);
										}}
										className="option"
										name="orphan_resources"
										checked={orphanWorkspace}
										data-testid="orphan-checkbox"
									/>
								</div>
								<div className="flex-col">
									<p className="info">孤立资源</p>
									<span className="text-xs mt-1 block">
										作为模板管理员，您可以跳过资源清理来删除失败的工作区。像卷和虚拟机这样的资源将不会被销毁。&nbsp;
										<Link
											href={docs(
												"/user-guides/workspace-management#workspace-resources",
											)}
											target="_blank"
											rel="noreferrer"
										>
											了解更多...
										</Link>
									</span>
								</div>
							</div>
						)}
					</form>
				</>
			}
		/>
	);
};

const styles = {
	workspaceInfo: (theme) => ({
		display: "flex",
		justifyContent: "space-between",
		borderRadius: 6,
		padding: 16,
		marginBottom: 20,
		lineHeight: "1.3em",
		border: `1px solid ${theme.palette.divider}`,

		"& .name": {
			fontSize: 16,
			fontWeight: 600,
			color: theme.palette.text.primary,
		},

		"& .label": {
			fontSize: 12,
			color: theme.palette.text.secondary,
		},

		"& .info": {
			fontSize: 12,
			fontWeight: 500,
			color: theme.palette.text.primary,
		},
	}),
	warnContainer: (theme) => ({
		marginTop: 24,
		display: "flex",
		backgroundColor: theme.roles.danger.background,
		justifyContent: "space-between",
		border: `1px solid ${theme.roles.danger.outline}`,
		borderRadius: 8,
		padding: 12,
		gap: 8,
		lineHeight: "18px",

		"& .option": {
			color: theme.roles.danger.fill.solid,
			"&.Mui-checked": {
				color: theme.roles.danger.fill.solid,
			},
		},

		"& .info": {
			fontSize: 14,
			fontWeight: 600,
			color: theme.roles.danger.text,
		},
	}),
} satisfies Record<string, Interpolation<Theme>>;
