import { CircleHelpIcon } from "lucide-react";
import type { FC } from "react";
import { Abbr } from "#/components/Abbr/Abbr";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { cn } from "#/utils/cn";
import { getLatencyColor } from "#/utils/latency";

interface LatencyProps {
	latency?: number;
	isLoading?: boolean;
	className?: string;
}

export const Latency: FC<LatencyProps> = ({
	latency,
	isLoading,
	className,
}) => {
	// Always use the no latency color for loading.
	const latencyColor = getLatencyColor(isLoading ? undefined : latency);

	if (isLoading) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					{/**
					 * Spinning progress icon must be placed inside a fixed-size container,
					 * to ensure tooltip remains stationary when opened
					 */}
					<div
						className={cn(
							"size-4 flex flex-wrap place-content-center",
							className,
						)}
					>
						<Spinner loading className={cn("!size-icon-xs", latencyColor)} />
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">正在加载延迟...</TooltipContent>
			</Tooltip>
		);
	}

	if (!latency) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<CircleHelpIcon
						aria-label="延迟数据不可用"
						className={cn("!size-icon-sm", latencyColor, className)}
					/>
				</TooltipTrigger>
				<TooltipContent side="bottom">延迟数据不可用</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<div className={cn("text-sm", latencyColor, className)}>
			<span className="sr-only">延迟： </span>
			{latency.toFixed(0)}
			<Abbr title="毫秒">ms</Abbr>
		</div>
	);
};
