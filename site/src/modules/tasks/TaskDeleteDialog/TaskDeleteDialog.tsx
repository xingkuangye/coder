import type { FC } from "react";
import { QueryClient, useMutation } from "react-query";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import type { Task } from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";

type TaskDeleteDialogProps = {
	open: boolean;
	task: Task;
	onClose: () => void;
	onSuccess?: () => void;
};

export const TaskDeleteDialog: FC<TaskDeleteDialogProps> = ({
	task,
	onSuccess,
	...props
}) => {
	const queryClient = new QueryClient();
	const deleteTaskMutation = useMutation({
		mutationFn: () => API.deleteTask(task.owner_name, task.id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return (
		<ConfirmDialog
			{...props}
			type="delete"
			confirmLoading={deleteTaskMutation.isPending}
			title="删除任务"
			onConfirm={() => {
				const mutation = deleteTaskMutation.mutateAsync();
				toast.promise(mutation, {
					loading: `正在删除 "${task.name}"...`,
					success: `"${task.name}" 已成功删除。`,
					error: (e) => ({
						message: getErrorMessage(e, `删除 ${task.name} 失败。`),
						description: getErrorDetail(e),
					}),
				});
				mutation.then(() => onSuccess?.()).finally(() => props.onClose());
			}}
			description={
				<p>
					此操作不可逆，将删除所有工作空间资源和数据。
				</p>
			}
		/>
	);
};
