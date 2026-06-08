import type { FC } from "react";
import { useDeploymentConfig } from "#/modules/management/DeploymentConfigProvider";
import { pageTitle } from "#/utils/page";
import { ExternalAuthSettingsPageView } from "./ExternalAuthSettingsPageView";

const ExternalAuthSettingsPage: FC = () => {
	const { deploymentConfig } = useDeploymentConfig();

	return (
		<>
			<title>{pageTitle("外部认证设置")}</title>

			<ExternalAuthSettingsPageView config={deploymentConfig.config} />
		</>
	);
};

export default ExternalAuthSettingsPage;
