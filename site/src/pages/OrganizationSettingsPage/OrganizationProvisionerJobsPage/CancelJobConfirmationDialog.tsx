import type { FC } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail } from "#/api/errors";
import {
	getProvisionerDaemonsKey,
	provisionerJobsQueryKey,
} from "#/api/queries/organizations";
import type { ProvisionerJob } from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";

type CancelJobConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	job: ProvisionerJob;
	cancelProvisionerJob?: typeof API.cancelProvisionerJob;
};

export const CancelJobConfirmationDialog: FC<
	CancelJobConfirmationDialogProps
> = ({
	job,
	cancelProvisionerJob = API.cancelProvisionerJob,
	...dialogProps
}) => {
	const queryClient = useQueryClient();
	const cancelMutation = useMutation({
		mutationFn: cancelProvisionerJob,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: provisionerJobsQueryKey(job.organization_id),
			});
			queryClient.invalidateQueries({
				queryKey: getProvisionerDaemonsKey(job.organization_id, job.tags),
			});
		},
	});

	return (
		<ConfirmDialog
			{...dialogProps}
			type="delete"
			title="取消配置器任务"
			description={`确定要取消配置器任务 "${job.id}" 吗？此操作将导致关联的工作区无法创建。`}
			confirmText="确认"
			cancelText="取消"
			confirmLoading={cancelMutation.isPending}
			onConfirm={async () => {
				const mutation = cancelMutation.mutateAsync(job, {
					onSuccess: () => {
						dialogProps.onClose();
					},
				});
				toast.promise(mutation, {
					loading: `正在取消配置器任务 "${job.id}"...`,
					success: `配置器任务 "${job.id}" 已成功取消。`,
					error: (error) => ({
						message: `无法取消配置器任务 "${job.id}"。`,
						description: getErrorDetail(error),
					}),
				});
			}}
		/>
	);
};
