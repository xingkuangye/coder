import type { FC } from "react";
import type { GetLicensesResponse } from "#/api/api";
import type { Feature } from "#/api/typesGenerated";
import { Link } from "#/components/Link/Link";
import {
	effectiveAiGovernanceLimitForUsageCard,
	hasAiGovernanceAddOnLicense,
} from "./AIGovernanceLicensing";
import { SeatUsageBarCard } from "./SeatUsageBarCard";

interface AIGovernanceUsersConsumptionProps {
	aiGovernanceUserFeature?: Feature;
	licenses?: GetLicensesResponse[];
}

export const AIGovernanceUsersConsumption: FC<
	AIGovernanceUsersConsumptionProps
> = ({ aiGovernanceUserFeature, licenses }) => {
	const hasAddOnLicense = hasAiGovernanceAddOnLicense(
		licenses,
		aiGovernanceUserFeature,
	);
	const effectiveLimit = effectiveAiGovernanceLimitForUsageCard(
		aiGovernanceUserFeature,
		licenses,
	);

	const showUsageBar =
		aiGovernanceUserFeature?.enabled === true ||
		(hasAddOnLicense && effectiveLimit !== undefined);

	if (!showUsageBar) {
		return (
			<div className="flex items-center justify-center rounded-lg border border-solid p-4">
				<div className="flex flex-col items-center justify-center">
					<div className="flex flex-col items-center justify-center">
						<span className="text-base">AI Governance 附加功能使用情况</span>
						<span className="text-content-secondary text-center max-w-[464px] mt-2">
							AI Governance 未包含在您当前的许可证中。请联系{" "}
							<Link href="mailto:sales@coder.com">销售</Link> 升级您的许可证以解锁此附加功能。
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<SeatUsageBarCard
			title="AI Governance 附加功能使用情况"
			actual={aiGovernanceUserFeature?.actual}
			limit={effectiveLimit}
		/>
	);
};
