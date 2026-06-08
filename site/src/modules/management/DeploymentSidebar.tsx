import type { FC } from "react";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { DeploymentSidebarView } from "./DeploymentSidebarView";

/**
 * 用于部署设置的侧边栏。
 */
export const DeploymentSidebar: FC = () => {
	const { permissions } = useAuthenticated();
	const { entitlements, showOrganizations, experiments, buildInfo } =
		useDashboard();
	const hasPremiumLicense =
		entitlements.features.multiple_organizations.enabled;

	return (
		<DeploymentSidebarView
			permissions={permissions}
			showOrganizations={showOrganizations}
			hasPremiumLicense={hasPremiumLicense}
			experiments={experiments}
			buildInfo={buildInfo}
		/>
	);
};
