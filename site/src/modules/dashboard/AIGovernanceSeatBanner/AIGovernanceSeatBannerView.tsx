import { TriangleAlertIcon } from "lucide-react";
import type { FC } from "react";
import { LicenseAIGovernance90PercentWarningText } from "#/api/typesGenerated";
import { Link } from "#/components/Link/Link";

type AIGovernanceSeatBannerViewProps =
	| { variant: "over-limit"; actual: number; limit: number }
	| { variant: "near-limit" };

export const AIGovernanceSeatBannerView: FC<AIGovernanceSeatBannerViewProps> = (
	props,
) => {
	if (props.variant === "near-limit") {
		return (
			<div role="alert" className="flex items-center bg-surface-secondary p-3">
				<div className="flex min-w-0 flex-1 items-start gap-2">
					<div className="flex h-[30px] items-center">
						<TriangleAlertIcon className="size-4 text-content-warning" />
					</div>
					<div className="flex min-w-0 flex-wrap items-center gap-1 py-1.5 text-xs font-medium leading-4 text-content-primary">
						<span>{LicenseAIGovernance90PercentWarningText}</span>
					</div>
				</div>
			</div>
		);
	}

	const { actual, limit } = props;
	const overPercent = Math.max(1, Math.floor(((actual - limit) / limit) * 100));

	return (
		<div role="alert" className="flex items-center bg-surface-orange p-3">
			<div className="flex min-w-0 flex-1 items-start gap-2">
				<div className="flex h-[30px] items-center">
					<TriangleAlertIcon className="size-4 text-content-warning" />
				</div>
				<div className="flex min-w-0 flex-wrap items-center gap-1 py-1.5 text-xs font-medium leading-4 text-content-primary">
					<span>
						您的组织正在使用 {actual} / {limit} 个 AI Governance 用户席位 (超出限制 {overPercent}%)。请联系{" "}
					</span>
					<Link href="mailto:sales@coder.com" showExternalIcon={false}>
						sales@coder.com
					</Link>
				</div>
			</div>
		</div>
	);
};
