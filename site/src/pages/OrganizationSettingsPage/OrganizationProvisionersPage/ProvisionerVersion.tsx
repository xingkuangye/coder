import { TriangleAlertIcon } from "lucide-react";
import type { FC } from "react";
import { StatusIndicator } from "#/components/StatusIndicator/StatusIndicator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";

type ProvisionerVersionProps = {
	buildVersion: string | undefined;
	provisionerVersion: string;
};

export const ProvisionerVersion: FC<ProvisionerVersionProps> = ({
	provisionerVersion,
	buildVersion,
}) => {
	return provisionerVersion === buildVersion ? (
		<span className="text-xs font-medium text-content-secondary">
			已是最新
		</span>
	) : (
		<Tooltip>
			<TooltipTrigger asChild>
				<StatusIndicator
					variant="warning"
					size="sm"
					className="cursor-pointer"
					tabIndex={0}
				>
					<TriangleAlertIcon className="size-icon-xs" />
					版本过旧
				</StatusIndicator>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs">
				<p className="m-0">
					此配置程序版本过旧。使用与 Coder 部署不匹配的配置程序版本可能导致问题。请升级到更新版本。
				</p>
			</TooltipContent>
		</Tooltip>
	);
};
