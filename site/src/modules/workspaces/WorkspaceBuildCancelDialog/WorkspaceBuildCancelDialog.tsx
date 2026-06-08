import type { FC } from "react";
import type { Workspace } from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";

interface WorkspaceBuildCancelDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	workspace: Workspace;
}

export const WorkspaceBuildCancelDialog: FC<
	WorkspaceBuildCancelDialogProps
> = ({ open, onClose, onConfirm, workspace }) => {
	const action =
		workspace.latest_build.status === "pending"
			? "从构建队列中移除当前构建"
			: "停止当前构建过程";

	return (
		<ConfirmDialog
			open={open}
			title="取消工作空间构建"
			description={`您确定要取消工作空间 "${workspace.name}" 的构建吗？这将${action}。`}
			confirmText="确认"
			cancelText="取消"
			onClose={onClose}
			onConfirm={onConfirm}
			type="delete"
		/>
	);
};
