import { BellIcon, BellOffIcon } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "#/api/errors";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { useWebpushNotifications } from "#/contexts/useWebpushNotifications";

interface WebPushButtonProps {
	webPush?: ReturnType<typeof useWebpushNotifications>;
	onToggle?: () => Promise<void> | void;
}

export const WebPushButton: FC<WebPushButtonProps> = ({
	webPush,
	onToggle,
}) => {
	const internalWebPush = useWebpushNotifications();
	const webPushState = webPush ?? internalWebPush;

	if (!webPushState.enabled) {
		return null;
	}

	const handleClick = async () => {
		if (onToggle) {
			await onToggle();
			return;
		}

		try {
			if (webPushState.subscribed) {
				await webPushState.unsubscribe();
			} else {
				await webPushState.subscribe();
			}
		} catch (error) {
			const action = webPushState.subscribed ? "禁用" : "启用";
			toast.error(getErrorMessage(error, `无法${action}通知。`));
		}
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="subtle"
					size="icon"
					disabled={webPushState.loading}
					onClick={handleClick}
					aria-label={
						webPushState.subscribed
							? "禁用通知"
							: "启用通知"
					}
					className="size-7 text-content-secondary hover:text-content-primary"
				>
					{webPushState.loading ? (
						<Spinner size="sm" loading />
					) : webPushState.subscribed ? (
						<BellIcon className="text-content-success" />
					) : (
						<BellOffIcon className="text-content-secondary" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{webPushState.subscribed
					? "禁用通知"
					: "启用通知"}
			</TooltipContent>
		</Tooltip>
	);
};
