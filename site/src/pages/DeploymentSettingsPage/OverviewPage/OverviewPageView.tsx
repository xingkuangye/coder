import type { FC } from "react";
import type {
	DAUsResponse,
	Experiment,
	SerpentOption,
} from "#/api/typesGenerated";
import { Alert, AlertTitle } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { useDeploymentOptions } from "#/utils/deployOptions";
import { docs } from "#/utils/docs";
import OptionsTable from "../OptionsTable";
import { UserEngagementChart } from "./UserEngagementChart";

type OverviewPageViewProps = {
	deploymentOptions: SerpentOption[];
	dailyActiveUsers: DAUsResponse | undefined;
	readonly invalidExperiments: readonly string[];
	readonly safeExperiments: readonly Experiment[];
};

export const OverviewPageView: FC<OverviewPageViewProps> = ({
	deploymentOptions,
	dailyActiveUsers,
	safeExperiments,
	invalidExperiments,
}) => {
	return (
		<>
			<SettingsHeader
				actions={<SettingsHeaderDocsLink href={docs("/admin/setup")} />}
			>
				<SettingsHeaderTitle>常规</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					您的 Coder 部署的相关信息。
				</SettingsHeaderDescription>
			</SettingsHeader>

			<div className="flex flex-col gap-8">
				<UserEngagementChart
					data={dailyActiveUsers?.entries.map((i) => ({
						date: i.date,
						users: i.amount,
					}))}
				/>
				{invalidExperiments.length > 0 && (
					<Alert severity="warning">
						<AlertTitle>正在使用的无效实验：</AlertTitle>
						<ul>
							{invalidExperiments.map((it) => (
								<li key={it}>
									<pre>{it}</pre>
								</li>
							))}
						</ul>
						建议您从配置中移除这些实验，
						因为它们没有任何效果。请参阅{" "}
						<Link
							href={docs("/reference/cli/server#--experiments")}
							target="_blank"
							rel="noreferrer"
						>
							文档
						</Link>{" "}
						以获取更多详情。
					</Alert>
				)}
				<OptionsTable
					options={useDeploymentOptions(
						deploymentOptions,
						"Access URL",
						"Wildcard Access URL",
						"Experiments",
					)}
					additionalValues={safeExperiments}
				/>
			</div>
		</>
	);
};
