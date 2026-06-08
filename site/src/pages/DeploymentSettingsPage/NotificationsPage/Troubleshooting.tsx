import type { FC } from "react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail } from "#/api/errors";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";

type TroubleshootingProps = {
	canEdit?: boolean;
};

export const Troubleshooting: FC<TroubleshootingProps> = ({
	canEdit = true,
}) => {
	const { mutate: sendTestNotificationApi, isPending } = useMutation({
		mutationFn: API.postTestNotification,
		onSuccess: () => toast.success("测试通知已发送。"),
		onError: (error) =>
			toast.error("测试通知发送失败。", {
				description: getErrorDetail(error),
			}),
	});

	return (
		<>
			<div className="text-sm text-content-secondary leading-relaxed mb-4">
				发送测试通知以排查通知设置问题。
			</div>
			<div>
				<span>
					<Button
						variant="outline"
						size="sm"
						disabled={isPending || !canEdit}
						onClick={() => {
							sendTestNotificationApi();
						}}
					>
						<Spinner loading={isPending} />
						发送通知
					</Button>
				</span>
			</div>
		</>
	);
};
