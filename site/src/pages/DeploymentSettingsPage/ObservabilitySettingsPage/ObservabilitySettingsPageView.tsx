import type { FC } from "react";
import type { SerpentOption } from "#/api/typesGenerated";
import {
	Badges,
	EnterpriseBadge,
	PremiumBadge,
} from "#/components/Badges/Badges";
import { PopoverPaywall } from "#/components/Paywall/PopoverPaywall";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { deploymentGroupHasParent } from "#/utils/deployOptions";
import { docs } from "#/utils/docs";
import OptionsTable from "../OptionsTable";

type ObservabilitySettingsPageViewProps = {
	options: SerpentOption[];
	featureAuditLogEnabled: boolean;
	isPremium: boolean;
};

export const ObservabilitySettingsPageView: FC<
	ObservabilitySettingsPageViewProps
> = ({ options, featureAuditLogEnabled, isPremium }) => {
	return (
		<div className="flex flex-col gap-12">
			<div>
				<SettingsHeader
					actions={<SettingsHeaderDocsLink href={docs("/admin/monitoring")} />}
				>
					<SettingsHeaderTitle>可观测性</SettingsHeaderTitle>
				</SettingsHeader>

				<SettingsHeader>
					<SettingsHeaderTitle hierarchy="secondary" level="h2">
						审计日志
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						允许审计员监控您部署中的用户操作。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Badges>
					<Tooltip>
						{featureAuditLogEnabled && !isPremium ? (
							<EnterpriseBadge />
						) : (
							<TooltipTrigger asChild>
								<span>
									<PremiumBadge />
								</span>
							</TooltipTrigger>
						)}

						<TooltipContent
							sideOffset={-28}
							collisionPadding={16}
							className="p-0"
						>
							<PopoverPaywall
								message="可观测性"
								description="拥有 Premium 许可证，您可以使用日志和指标监控您的应用程序。"
								documentationLink={docs("/admin/monitoring")}
							/>
						</TooltipContent>
					</Tooltip>
				</Badges>
			</div>

			<div>
				<SettingsHeader>
					<SettingsHeaderTitle hierarchy="secondary" level="h2">
						监控
					</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						使用日志和指标监控您的 Coder 应用程序。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<OptionsTable
					options={options.filter((o) =>
						deploymentGroupHasParent(o.group, "Introspection"),
					)}
				/>
			</div>
		</div>
	);
};
