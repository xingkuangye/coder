import type { ProvisionerJob } from "#/api/typesGenerated";

export const getPendingStatusLabel = (
	provisionerJob?: ProvisionerJob,
): string => {
	if (!provisionerJob || provisionerJob.queue_size === 0) {
		return "等待中";
	}
	return `队列位置：${provisionerJob.queue_position}`;
};
