import type { FC } from "react";
import { useDeploymentConfig } from "#/modules/management/DeploymentConfigProvider";
import { pageTitle } from "#/utils/page";
import { UserAuthSettingsPageView } from "./UserAuthSettingsPageView";

const UserAuthSettingsPage: FC = () => {
	const { deploymentConfig } = useDeploymentConfig();

	return (
		<>
			<title>{pageTitle("用户认证设置")}</title>

			<UserAuthSettingsPageView options={deploymentConfig.options} />
		</>
	);
};

export default UserAuthSettingsPage;
