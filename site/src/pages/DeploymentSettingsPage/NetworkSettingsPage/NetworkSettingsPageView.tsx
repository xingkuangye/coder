import type { FC } from "react";
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

type NetworkSettingsPageViewProps = {
	options: SerpentOption[];
};

export const NetworkSettingsPageView: FC<NetworkSettingsPageViewProps> = ({
	options,
}) => (
	<div className="flex flex-col gap-12">
		<div>
			<SettingsHeader
				actions={<SettingsHeaderDocsLink href={docs("/admin/networking")} />}
			>
				<SettingsHeaderTitle>网络</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					配置您的部署网络连接。
				</SettingsHeaderDescription>
			</SettingsHeader>

			<OptionsTable
				options={options.filter((o) =>
					deploymentGroupHasParent(o.group, "Networking"),
				)}
			/>
		</div>

		<div>
			<SettingsHeader
				actions={
					<SettingsHeaderDocsLink
						href={docs("/admin/networking/port-forwarding")}
					/>
				}
			>
				<SettingsHeaderTitle level="h2" hierarchy="secondary">
					端口转发
				</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					端口转发允许开发者从本地计算机安全地访问其 Coder 工作区中的进程。
				</SettingsHeaderDescription>
			</SettingsHeader>

			<Badges>
				{useDeploymentOptions(options, "Wildcard Access URL")[0].value !==
				"" ? (
					<EnabledBadge />
				) : (
					<DisabledBadge />
				)}
			</Badges>
		</div>
	</div>
);
