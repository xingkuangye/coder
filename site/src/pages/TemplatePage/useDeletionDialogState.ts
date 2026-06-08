import { useState } from "react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorMessage } from "#/api/errors";

export const useDeletionDialogState = (
	templateId: string,
	onDelete: () => void,
	templateName?: string,
) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const deleteMutation = useMutation({
		mutationFn: () => API.deleteTemplate(templateId),
	});

	const openDeleteConfirmation = () => {
		setIsDeleteDialogOpen(true);
	};

	const cancelDeleteConfirmation = () => {
		setIsDeleteDialogOpen(false);
	};

	const confirmDelete = () => {
		const label = templateName ? ` "${templateName}"` : "";
		const mutation = deleteMutation.mutateAsync();
		toast.promise(mutation, {
			loading: `正在删除模板${label}...`,
			success: `模板${label}删除成功。`,
			error: (error) =>
				getErrorMessage(error, `删除模板${label}失败。`),
		});
		mutation.then(() => onDelete());
	};

	return {
		isDeleteDialogOpen,
		openDeleteConfirmation,
		cancelDeleteConfirmation,
		confirmDelete,
	};
};
