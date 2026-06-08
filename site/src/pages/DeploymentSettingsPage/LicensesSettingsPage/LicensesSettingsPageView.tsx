import { useTheme } from "@emotion/react";
import MuiLink from "@mui/material/Link";
import { PlusIcon, RotateCwIcon } from "lucide-react";
import type { FC } from "react";
import Confetti from "react-confetti";
import { Link as RouterLink } from "react-router";
import type { GetLicensesResponse } from "#/api/api";
import type { Feature, UserStatusChangeCount } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { useWindowSize } from "#/hooks/useWindowSize";
import { AIGovernanceUsersConsumption } from "./AIGovernanceUsersConsumptionChart";
import { LicenseCard } from "./LicenseCard";
import { LicenseSeatConsumptionChart } from "./LicenseSeatConsumptionChart";
import { ManagedAgentsConsumption } from "./ManagedAgentsConsumption";
import { SeatUsageBarCard } from "./SeatUsageBarCard";

type Props = {
	showConfetti: boolean;
	isLoading: boolean;
	hasUserLimitEntitlementData: boolean;
	userLimitActual?: number;
	userLimitLimit?: number;
	licenses?: GetLicensesResponse[];
	isRemovingLicense: boolean;
	isRefreshing: boolean;
	removeLicense: (licenseId: number) => void;
	refreshEntitlements: () => void;
	activeUsers: UserStatusChangeCount[] | undefined;
	managedAgentFeature?: Feature;
	aiGovernanceUserFeature?: Feature;
};

const LicensesSettingsPageView: FC<Props> = ({
	showConfetti,
	isLoading,
	hasUserLimitEntitlementData,
	userLimitActual,
	userLimitLimit,
	licenses,
	isRemovingLicense,
	isRefreshing,
	removeLicense,
	refreshEntitlements,
	activeUsers,
	managedAgentFeature,
	aiGovernanceUserFeature,
}) => {
	const theme = useTheme();
	const { width, height } = useWindowSize();

	return (
		<>
			<Confetti
				// For some reason this overflows the window and adds scrollbars if we don't subtract here.
				width={width - 1}
				height={height - 1}
				numberOfPieces={showConfetti ? 200 : 0}
				colors={[theme.palette.primary.main, theme.palette.secondary.main]}
			/>

			<div className="flex flex-row gap-4 items-baseline justify-between">
				<SettingsHeader>
					<SettingsHeaderTitle>许可证</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						管理许可证以解锁高级功能。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<div className="flex flex-row gap-4">
					<Button variant="outline" asChild>
						<RouterLink to="/deployment/licenses/add">
							<PlusIcon />
							添加许可证
						</RouterLink>
					</Button>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								disabled={isRefreshing}
								onClick={refreshEntitlements}
								variant="outline"
							>
								<Spinner loading={isRefreshing}>
									<RotateCwIcon />
								</Spinner>
								刷新
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="max-w-xs">
							刷新许可证权益。每10分钟自动执行一次。
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{isLoading && <Skeleton height={78} />}

				{!isLoading && licenses && licenses?.length > 0 && (
					<div className="flex flex-col gap-8 licenses">
						{[...(licenses ?? [])]
							?.sort(
								(a, b) =>
									new Date(b.claims.license_expires).valueOf() -
									new Date(a.claims.license_expires).valueOf(),
							)
							.map((license) => (
								<LicenseCard
									key={license.id}
									license={license}
									userLimitActual={userLimitActual}
									userLimitLimit={userLimitLimit}
									aiGovernanceUserFeature={aiGovernanceUserFeature}
									isRemoving={isRemovingLicense}
									onRemove={removeLicense}
								/>
							))}
					</div>
				)}

				{!isLoading && licenses?.length === 0 && (
					<div className="min-h-[240px] flex items-center justify-center rounded-lg border border-solid border-border p-12">
						<div className="flex flex-col gap-2 items-center">
							<div className="flex flex-col gap-1 items-center">
								<span className="text-base">
									您没有任何许可证！
								</span>
								<span className="text-content-secondary text-center max-w-[464px] mt-2">
									您错失了高可用性、RBAC、配额等诸多功能。请联系{" "}
									<MuiLink href="mailto:sales@coder.com">销售</MuiLink> 或{" "}
									<MuiLink href="https://coder.com/trial">
										申请试用许可证
									</MuiLink>{" "}
									开始使用。
								</span>
							</div>
						</div>
					</div>
				)}

				{licenses && licenses.length > 0 && (
					<>
						<LicenseSeatConsumptionChart
							limit={userLimitLimit}
							data={activeUsers?.map((i) => ({
								date: i.date,
								users: i.count,
								limit: 80,
							}))}
						/>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{hasUserLimitEntitlementData && (
								<SeatUsageBarCard
									title="席位使用情况"
									actual={userLimitActual}
									limit={userLimitLimit}
									allowUnlimited
								/>
							)}
							<AIGovernanceUsersConsumption
								aiGovernanceUserFeature={aiGovernanceUserFeature}
								licenses={licenses}
							/>
						</div>

						<ManagedAgentsConsumption
							managedAgentFeature={managedAgentFeature}
						/>
					</>
				)}
			</div>
		</>
	);
};

export default LicensesSettingsPageView;
