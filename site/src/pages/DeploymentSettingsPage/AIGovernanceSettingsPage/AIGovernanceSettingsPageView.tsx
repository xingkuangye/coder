import type { FC } from "react";
import type { SerpentOption } from "#/api/typesGenerated";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
import { PaywallAIGovernance } from "#/components/Paywall/PaywallAIGovernance";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { deploymentGroupHasParent } from "#/utils/deployOptions";
import { docs } from "#/utils/docs";
import OptionsTable from "../OptionsTable";

type AIGovernanceSettingsPageViewProps = {
	options: SerpentOption[];
	featureAIBridgeEntitled: boolean;
	featureAIBridgeEnabled: boolean;
};

export const AIGovernanceSettingsPageView: FC<
	AIGovernanceSettingsPageViewProps
> = ({ options, featureAIBridgeEntitled, featureAIBridgeEnabled }) => {
	return (
		<div className="flex flex-col gap-12">
			<SettingsHeader>
				<SettingsHeaderTitle>AI 治理</SettingsHeaderTitle>
			</SettingsHeader>

			<div>
				<SettingsHeader
					actions={
						<SettingsHeaderDocsLink href={docs("/ai-coder/ai-gateway")} />
					}
				>
					<SettingsHeaderTitle hierarchy="secondary" level="h2">
						AI 网关
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						监控和管理整个部署中的 AI 请求。
					</SettingsHeaderDescription>
				</SettingsHeader>

				{featureAIBridgeEntitled ? (
					<>
						{!featureAIBridgeEnabled && (
							<Alert className="mb-12" severity="warning" prominent>
								<AlertTitle>
									AI 网关已包含在您的许可证中，但尚未设置。
								</AlertTitle>
								<AlertDescription>
									您有 AI 治理的访问权限，但仍需设置。请查看{" "}
									<Link href={docs("/ai-coder/ai-gateway")} target="_blank">
										AI 网关
									</Link>{" "}
									文档以开始使用。
								</AlertDescription>
							</Alert>
						)}
						<OptionsTable
							options={options
								.filter((o) => deploymentGroupHasParent(o.group, "AI Gateway"))
								.filter((o) => !o.annotations?.secret === true)}
						/>
					</>
				) : (
					<PaywallAIGovernance />
				)}
			</div>
		</div>
	);
};
