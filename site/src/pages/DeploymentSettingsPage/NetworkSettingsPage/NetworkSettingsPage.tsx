import type { FC } from "react";
import { useDeploymentConfig } from "#/modules/management/DeploymentConfigProvider";
import { pageTitle } from "#/utils/page";
import { NetworkSettingsPageView } from "./NetworkSettingsPageView";

const NetworkSettingsPage: FC = () => {
	const { deploymentConfig } = useDeploymentConfig();

	return (
		<>
			<title>{pageTitle("网络设置")}</title>

			<NetworkSettingsPageView options={deploymentConfig.options} />
		</>
	);
};

export default NetworkSettingsPage;
