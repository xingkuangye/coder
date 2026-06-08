import type { FC } from "react";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import type { APIKeyWithOwner } from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { useDeleteToken } from "./hooks";

interface ConfirmDeleteDialogProps {
	queryKey: (string | boolean)[];
	token: APIKeyWithOwner | undefined;
	setToken: (arg: APIKeyWithOwner | undefined) => void;
}

export const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({
	queryKey,
	token,
	setToken,
}) => {
	const tokenName = token?.token_name;

	const { mutate: deleteToken, isPending: isDeleting } =
		useDeleteToken(queryKey);

	const onDeleteSuccess = () => {
		toast.success("令牌已删除。");
		setToken(undefined);
	};

	const onDeleteError = (error: Error) => {
		const message = getErrorMessage(error, "删除令牌失败");
		toast.error(message, {
			description: getErrorDetail(error),
		});
		setToken(undefined);
	};

	return (
		<ConfirmDialog
			type="delete"
			title="删除令牌"
			description={
				<>
					您确定要永久删除令牌{" "}
					<strong>{tokenName}</strong>吗？
				</>
			}
			open={Boolean(token) || isDeleting}
			confirmLoading={isDeleting}
			onConfirm={() => {
				if (!token) {
					return;
				}
				deleteToken(token.id, {
					onError: onDeleteError,
					onSuccess: onDeleteSuccess,
				});
			}}
			onClose={() => {
				setToken(undefined);
			}}
		/>
	);
};
