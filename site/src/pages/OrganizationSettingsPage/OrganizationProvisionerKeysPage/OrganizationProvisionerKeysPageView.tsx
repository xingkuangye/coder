import type { FC } from "react";
import {
	type ProvisionerKeyDaemons,
	ProvisionerKeyIDBuiltIn,
	ProvisionerKeyIDPSK,
	ProvisionerKeyIDUserAuth,
} from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Link } from "#/components/Link/Link";
import { Loader } from "#/components/Loader/Loader";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import {
	SettingsHeader,
	SettingsHeaderDescription,
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
import { ProvisionerKeyRow } from "./ProvisionerKeyRow";

// If the user using provisioner keys for external provisioners you're unlikely to
// want to keep the built-in provisioners.
const HIDDEN_PROVISIONER_KEYS = [
	ProvisionerKeyIDBuiltIn,
	ProvisionerKeyIDUserAuth,
	ProvisionerKeyIDPSK,
];

interface OrganizationProvisionerKeysPageViewProps {
	showPaywall: boolean | undefined;
	provisionerKeyDaemons: ProvisionerKeyDaemons[] | undefined;
	error: unknown;
	onRetry: () => void;
}

export const OrganizationProvisionerKeysPageView: FC<
	OrganizationProvisionerKeysPageViewProps
> = ({ showPaywall, provisionerKeyDaemons, error, onRetry }) => {
	const filteredProvisionerKeyDaemons = provisionerKeyDaemons?.filter(
		(pkd) => !HIDDEN_PROVISIONER_KEYS.includes(pkd.key.id),
	);

	return (
		<section className="w-full max-w-screen-2xl pb-10">
			<SettingsHeader>
				<SettingsHeaderTitle>配置器密钥</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					管理用于验证配置器实例的配置器密钥。{" "}
					<Link href={docs("/admin/provisioners")}>查看文档</Link>
				</SettingsHeaderDescription>
			</SettingsHeader>

			{showPaywall ? (
				<PaywallPremium
					message="配置器"
					description="配置器运行您的 Terraform 以创建模板和工作区。您需要 Premium 许可证才能在多个组织中使用此功能。"
					documentationLink={docs("/admin/provisioners")}
				/>
			) : (
				<Table className="mt-6">
					<TableHeader>
						<TableRow>
							<TableHead>名称</TableHead>
							<TableHead>标签</TableHead>
							<TableHead>活跃配置器</TableHead>
							<TableHead>创建时间</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProvisionerKeyDaemons ? (
							filteredProvisionerKeyDaemons.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5}>
										<EmptyState
											message="无配置器密钥"
											description="创建您的第一个配置器密钥以验证外部配置器守护程序。"
										/>
									</TableCell>
								</TableRow>
							) : (
								filteredProvisionerKeyDaemons.map((pkd) => (
									<ProvisionerKeyRow
										key={pkd.key.id}
										provisionerKey={pkd.key}
										provisioners={pkd.daemons}
										defaultIsOpen={false}
									/>
								))
							)
						) : error ? (
							<TableRow>
								<TableCell colSpan={5}>
									<EmptyState
										message="加载配置器密钥时出错"
										cta={
											<Button onClick={onRetry} size="sm">
												重试
											</Button>
										}
									/>
								</TableCell>
							</TableRow>
						) : (
							<TableRow>
								<TableCell colSpan={999}>
									<Loader />
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			)}
		</section>
	);
};
