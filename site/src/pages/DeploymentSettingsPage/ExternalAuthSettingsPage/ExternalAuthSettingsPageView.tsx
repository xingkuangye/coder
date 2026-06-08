import type { FC } from "react";
import type {
	DeploymentValues,
	ExternalAuthConfig,
} from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { PremiumBadge } from "#/components/Badges/Badges";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderDocsLink,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { docs } from "#/utils/docs";

type ExternalAuthSettingsPageViewProps = {
	config: DeploymentValues;
};

export const ExternalAuthSettingsPageView: FC<
	ExternalAuthSettingsPageViewProps
> = ({ config }) => {
	return (
		<>
			<SettingsHeader
				actions={<SettingsHeaderDocsLink href={docs("/admin/external-auth")} />}
			>
				<SettingsHeaderTitle>外部认证</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					Coder 集成了 GitHub、GitLab、BitBucket、Azure Repos 和 OpenID
					Connect，用于通过外部服务验证开发者身份。
				</SettingsHeaderDescription>
			</SettingsHeader>

			<video
				autoPlay
				muted
				loop
				playsInline
				src="/external-auth.mp4"
				style={{
					maxWidth: "100%",
					borderRadius: 4,
				}}
			/>

			<div className="mt-6 mb-6">
				<Alert severity="info" actions={<PremiumBadge key="enterprise" />}>
					集成多个外部认证提供者是一项 Premium 功能。
				</Alert>
			</div>

			<Table className="[&_td]:py-6 [&_td:last-child]:pl-8 [&_th:last-child]:pl-8">
				<TableHeader>
					<TableRow>
						<TableHead className="w-1/3">ID</TableHead>
						<TableHead className="w-1/3">客户端 ID</TableHead>
						<TableHead className="w-1/3">匹配</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{((config.external_auth === null ||
						config.external_auth?.length === 0) && (
						<TableRow>
							<TableCell colSpan={999}>
								<div className="text-center">
									尚未配置任何提供程序！
								</div>
							</TableCell>
						</TableRow>
					)) ||
						config.external_auth?.map((git: ExternalAuthConfig) => {
							const name = git.id || git.type;
							return (
								<TableRow key={name}>
									<TableCell>{name}</TableCell>
									<TableCell>{git.client_id}</TableCell>
									<TableCell>{git.regex || "未设置"}</TableCell>
								</TableRow>
							);
						})}
				</TableBody>
			</Table>
		</>
	);
};
