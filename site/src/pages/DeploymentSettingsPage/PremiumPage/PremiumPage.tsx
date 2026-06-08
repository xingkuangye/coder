import type { FC } from "react";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { pageTitle } from "#/utils/page";
import { PremiumPageView } from "./PremiumPageView";

const PremiumPage: FC = () => {
	const { entitlements } = useDashboard();

	return (
		<>
			<title>{pageTitle("高级功能")}</title>

			<PremiumPageView isEnterprise={entitlements.has_license} />
		</>
	);
};

export default PremiumPage;
