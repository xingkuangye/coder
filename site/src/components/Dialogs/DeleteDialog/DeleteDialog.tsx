import TextField from "@mui/material/TextField";
import { useId, useState } from "react";
import { Alert } from "#/components/Alert/Alert";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";

interface DeleteDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	entity: string;
	name: string;
	info?: string;
	confirmLoading?: boolean;
	verb?: string;
	title?: string;
	label?: string;
	confirmText?: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
	isOpen,
	onCancel,
	onConfirm,
	entity,
	info,
	name,
	confirmLoading,
	// All optional to change the verbiage. For example, "unlinking" vs "deleting"
	verb,
	title,
	label,
	confirmText,
}) => {
	const hookId = useId();

	const [userConfirmationText, setUserConfirmationText] = useState("");
	const [isFocused, setIsFocused] = useState(false);

	const deletionConfirmed = name === userConfirmationText;
	const onSubmit = (event: React.SubmitEvent) => {
		event.preventDefault();
		if (deletionConfirmed) {
			onConfirm();
		}
	};

	const hasError = !deletionConfirmed && userConfirmationText.length > 0;
	const displayErrorMessage = hasError && !isFocused;
	const inputColor = hasError ? "error" : "primary";

	return (
		<ConfirmDialog
			type="delete"
			hideCancel={false}
			open={isOpen}
			title={title ?? `删除${entity}`}
			onConfirm={onConfirm}
			onClose={onCancel}
			confirmLoading={confirmLoading}
			disabled={!deletionConfirmed}
			confirmText={confirmText}
			description={
				<>
					<div className="flex flex-col gap-3">
						<p>
							{verb ?? "删除"}此{entity}是不可逆的！
						</p>
						{Boolean(info) && (
							<Alert severity="warning" prominent>
								{info}
							</Alert>
						)}
						<p>
							请在下方输入 <strong>{name}</strong> 以确认。
						</p>
					</div>

					<form onSubmit={onSubmit}>
						<TextField
							fullWidth
							autoFocus
							className="mt-6"
							name="confirmation"
							autoComplete="off"
							id={`${hookId}-confirm`}
							placeholder={name}
							value={userConfirmationText}
							onChange={(event) => setUserConfirmationText(event.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							label={label ?? `要删除的${entity}的名称`}
							color={inputColor}
							error={displayErrorMessage}
							helperText={
								displayErrorMessage &&
								`${userConfirmationText} 与此${entity}的名称不匹配`
							}
							InputProps={{ color: inputColor }}
							inputProps={{
								"data-testid": "delete-dialog-name-confirmation",
							}}
						/>
					</form>
				</>
			}
		/>
	);
};
