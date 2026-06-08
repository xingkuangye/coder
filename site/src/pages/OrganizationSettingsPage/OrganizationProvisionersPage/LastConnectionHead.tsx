import { InfoIcon } from "lucide-react";
import type { FC } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
export const LastConnectionHead: FC = () => {
	return (
		<span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-content-secondary">
			上次连接
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="flex items-center">
						<span className="sr-only">更多信息</span>
						<InfoIcon
							tabIndex={0}
							className="cursor-pointer size-icon-xs p-0.5"
						/>
					</span>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs">
					上次 provisioner 连接到控制平面的时间
				</TooltipContent>
			</Tooltip>
		</span>
	);
};
