import type { ReactNode } from "react";
import { PremiumBadge } from "#/components/Badges/Badges";
import { cn } from "#/utils/cn";
import {
	Paywall,
	PaywallContent,
	PaywallCTA,
	PaywallDescription,
	PaywallDocumentationLink,
	PaywallFeature,
	PaywallFeatures,
	PaywallHeading,
	PaywallSeparator,
	PaywallStack,
	PaywallTitle,
} from "./Paywall";

type PaywallPremiumProps = React.ComponentProps<"div"> & {
	message: string;
	description: ReactNode;
	documentationLink: string;
	compact?: boolean;
};

const PaywallPremium = ({
	message,
	description,
	documentationLink,
	compact = false,
	className,
	...props
}: PaywallPremiumProps) => {
	const PREMIUM_FEATURES = [
		"高可用性与工作区代理",
		"多组织与基于角色的访问控制",
		"7x24小时全球支持（含SLA）",
		"无限Git与外部身份验证集成",
	];

	return (
		<Paywall
			className={cn(
				compact && "max-w-[770px] py-4 px-[36px] gap-[18px] min-h-[230px]",
				className,
			)}
			{...props}
		>
			<PaywallContent>
				<PaywallHeading className={cn(compact && "mb-[18px]")}>
					<PaywallTitle className={cn(compact && "text-lg leading-none")}>
						{message}
					</PaywallTitle>
					<PremiumBadge />
				</PaywallHeading>
				<PaywallDescription
					className={cn(
						compact &&
							"text-sm max-w-[360px] mt-2 mb-3.5 leading-relaxed text-content-secondary",
					)}
				>
					{description}
				</PaywallDescription>
				<PaywallDocumentationLink href={documentationLink}>
					阅读文档
				</PaywallDocumentationLink>
			</PaywallContent>
			<PaywallSeparator className="h-[180px]" />
			<PaywallStack className={cn(compact && "gap-4")}>
				<PaywallFeatures className={cn(compact && "pr-0")}>
					{PREMIUM_FEATURES.map((feature) => (
						<PaywallFeature
							className={cn(compact && "text-[13px] leading-tight")}
							key={feature}
						>
							{feature}
						</PaywallFeature>
					))}
				</PaywallFeatures>
				<PaywallCTA href="https://coder.com/pricing#compare-plans">
					了解高级版
				</PaywallCTA>
			</PaywallStack>
		</Paywall>
	);
};

export { PaywallPremium };
