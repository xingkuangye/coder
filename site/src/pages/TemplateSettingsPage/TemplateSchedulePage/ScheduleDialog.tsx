import type { Interpolation, Theme } from "@emotion/react";
import Checkbox from "@mui/material/Checkbox";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { FC } from "react";
import type { ConfirmDialogProps } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { Dialog, DialogActionButtons } from "#/components/Dialogs/Dialog";

interface ScheduleDialogProps extends ConfirmDialogProps {
	readonly inactiveWorkspacesToGoDormant: number;
	readonly inactiveWorkspacesToGoDormantInWeek: number;
	readonly dormantWorkspacesToBeDeleted: number;
	readonly dormantWorkspacesToBeDeletedInWeek: number;
	readonly updateDormantWorkspaces: (confirm: boolean) => void;
	readonly updateInactiveWorkspaces: (confirm: boolean) => void;
	readonly dormantValueChanged: boolean;
	readonly deletionValueChanged: boolean;
}

export const ScheduleDialog: FC<ScheduleDialogProps> = ({
	cancelText,
	confirmLoading,
	disabled = false,
	hideCancel,
	onClose,
	onConfirm,
	open = false,
	title,
	inactiveWorkspacesToGoDormant,
	inactiveWorkspacesToGoDormantInWeek,
	dormantWorkspacesToBeDeleted,
	dormantWorkspacesToBeDeletedInWeek,
	updateDormantWorkspaces,
	updateInactiveWorkspaces,
	dormantValueChanged,
	deletionValueChanged,
}) => {
	const defaults = {
		confirmText: "删除",
		hideCancel: false,
	};

	if (typeof hideCancel === "undefined") {
		hideCancel = defaults.hideCancel;
	}

	const showDormancyWarning =
		dormantValueChanged &&
		(inactiveWorkspacesToGoDormant > 0 ||
			inactiveWorkspacesToGoDormantInWeek > 0);
	const showDeletionWarning =
		deletionValueChanged &&
		(dormantWorkspacesToBeDeleted > 0 ||
			dormantWorkspacesToBeDeletedInWeek > 0);

	return (
		<Dialog
			css={styles.dialogWrapper}
			onClose={onClose}
			open={open}
			data-testid="dialog"
		>
			<div css={styles.dialogContent}>
				<h3 css={styles.dialogTitle}>{title}</h3>

				{showDormancyWarning && (
					<>
						<h4>休眠阈值</h4>
						<p css={styles.dialogDescription}>
							此更改将导致{" "}
							<strong>{inactiveWorkspacesToGoDormant}</strong>{" "}
							个工作区立即转入休眠状态，并在接下来 7 天内导致{" "}
							<strong>{inactiveWorkspacesToGoDormantInWeek}</strong>{" "}
							个工作区转入休眠。要避免此情况，是否要重置所有模板工作区的非活动期？
						</p>
						<FormControlLabel
							className="mt-4"
							control={
								<Checkbox
									size="small"
									onChange={(e) => {
										updateInactiveWorkspaces(e.target.checked);
									}}
								/>
							}
							label="防止休眠 - 重置所有工作区的非活动期"
						/>
					</>
				)}

				{showDeletionWarning && (
					<>
						<h4>休眠自动删除</h4>
						<p css={styles.dialogDescription}>
							此更改将导致{" "}
							<strong>{dormantWorkspacesToBeDeleted}</strong>{" "}
							个工作区被立即删除，并在接下来 7 天内导致{" "}
							<strong>{dormantWorkspacesToBeDeletedInWeek}</strong>{" "}
							个工作区被删除。要避免此情况，是否要重置所有模板工作区的休眠期？
						</p>
						<FormControlLabel
							className="mt-4"
							control={
								<Checkbox
									size="small"
									onChange={(e) => {
										updateDormantWorkspaces(e.target.checked);
									}}
								/>
							}
							label="防止删除 - 重置所有工作区的休眠期"
						/>
					</>
				)}
			</div>

			<DialogActions>
				<DialogActionButtons
					cancelText={cancelText}
					confirmLoading={confirmLoading}
					confirmText="提交"
					disabled={disabled}
					onCancel={!hideCancel ? onClose : undefined}
					onConfirm={onConfirm || onClose}
					type="delete"
				/>
			</DialogActions>
		</Dialog>
	);
};

const styles = {
	dialogWrapper: (theme) => ({
		"& .MuiPaper-root": {
			background: theme.palette.background.paper,
			border: `1px solid ${theme.palette.divider}`,
		},
		"& .MuiDialogActions-spacing": {
			padding: "0 40px 40px",
		},
	}),
	dialogContent: (theme) => ({
		color: theme.palette.text.secondary,
		padding: 40,
	}),
	dialogTitle: (theme) => ({
		margin: 0,
		marginBottom: 16,
		color: theme.palette.text.primary,
		fontWeight: 400,
		fontSize: 20,
	}),
	dialogDescription: (theme) => ({
		color: theme.palette.text.secondary,
		lineHeight: "160%",
		fontSize: 16,

		"& strong": {
			color: theme.palette.text.primary,
		},

		"& p:not(.MuiFormHelperText-root)": {
			margin: 0,
		},

		"& > p": {
			margin: "8px 0",
		},
	}),
} satisfies Record<string, Interpolation<Theme>>;
