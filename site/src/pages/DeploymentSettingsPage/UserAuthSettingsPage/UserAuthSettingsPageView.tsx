import type { JSX } from "react";
import type { SerpentOption } from "#/api/typesGenerated";
import {
	Badges,
	DisabledBadge,
	EnabledBadge,
} from "#/components/Badges/Badges";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	deploymentGroupHasParent,
	useDeploymentOptions,
} from "#/utils/deployOptions";
import { docs } from "#/utils/docs";
import OptionsTable from "../OptionsTable";

type UserAuthSettingsPageViewProps = {
	options: SerpentOption[];
};

export const UserAuthSettingsPageView = ({
	options,
}: UserAuthSettingsPageViewProps): JSX.Element => {
	const oidcEnabled = Boolean(
		useDeploymentOptions(options, "OIDC Client ID")[0].value,
	);
	const githubEnabled = Boolean(
		useDeploymentOptions(options, "OAuth2 GitHub Client ID")[0].value,
	);

	return (
		<div className="flex flex-col gap-12">
			<div>
				<SettingsHeader>
					<SettingsHeaderTitle>用户认证</SettingsHeaderTitle>
				</SettingsHeader>

				<SettingsHeader
					actions={
						<SettingsHeaderDocsLink
							href={docs("/admin/users/oidc-auth#openid-connect")}
						/>
					}
				>
					<SettingsHeaderTitle level="h2" hierarchy="secondary">
						使用 OpenID Connect 登录
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						配置认证以使用 OpenID Connect 登录。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Badges>{oidcEnabled ? <EnabledBadge /> : <DisabledBadge />}</Badges>

				{oidcEnabled && (
					<OptionsTable
						options={options.filter((o) =>
							deploymentGroupHasParent(o.group, "OIDC"),
						)}
					/>
				)}
			</div>

			<div>
				<SettingsHeader
					actions={
						<SettingsHeaderDocsLink href={docs("/admin/users/github-auth")} />
					}
				>
					<SettingsHeaderTitle level="h2" hierarchy="secondary">
						使用 GitHub 登录
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						配置认证以使用 GitHub 登录。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Badges>{githubEnabled ? <EnabledBadge /> : <DisabledBadge />}</Badges>

				{githubEnabled && (
					<OptionsTable
						options={options.filter((o) =>
							deploymentGroupHasParent(o.group, "GitHub"),
						)}
					/>
				)}
			</div>
		</div>
	);
};
