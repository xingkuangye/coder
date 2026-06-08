import type { FC } from "react";
import type { SerpentOption } from "#/api/typesGenerated";
import {
	Badges,
	DisabledBadge,
	EnabledBadge,
	PremiumBadge,
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

type SecuritySettingsPageViewProps = {
	options: SerpentOption[];
	featureBrowserOnlyEnabled: boolean;
};

export const SecuritySettingsPageView: FC<SecuritySettingsPageViewProps> = ({
	options,
	featureBrowserOnlyEnabled,
}) => {
	const tlsOptions = options.filter((o) =>
		deploymentGroupHasParent(o.group, "TLS"),
	);

	return (
		<div className="flex flex-col gap-12">
			<div>
				<SettingsHeader>
					<SettingsHeaderTitle>安全</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						确保您的 Coder 部署是安全的。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<OptionsTable
					options={useDeploymentOptions(
						options,
						"SSH Keygen Algorithm",
						"Secure Auth Cookie",
						"Disable Owner Workspace Access",
					)}
				/>
			</div>

			<div>
				<SettingsHeader
					actions={
						<SettingsHeaderDocsLink
							href={docs("/admin/networking#browser-only-connections")}
						/>
					}
				>
					<SettingsHeaderTitle level="h2" hierarchy="secondary">
						仅限浏览器连接
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						阻止所有通过 SSH、端口转发和其他非浏览器连接的工作区访问。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Badges>
					{featureBrowserOnlyEnabled ? <EnabledBadge /> : <DisabledBadge />}
					<PremiumBadge />
				</Badges>
			</div>

			{tlsOptions.length > 0 && (
				<div>
					<SettingsHeader>
						<SettingsHeaderTitle level="h2" hierarchy="secondary">
							TLS
						</SettingsHeaderTitle>
						<SettingsHeaderDescription>
							确保为您的 Coder 部署正确配置了 TLS。
						</SettingsHeaderDescription>
					</SettingsHeader>

					<OptionsTable options={tlsOptions} />
				</div>
			)}
		</div>
	);
};
