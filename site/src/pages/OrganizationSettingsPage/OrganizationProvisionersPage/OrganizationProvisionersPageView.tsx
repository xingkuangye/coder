import { XIcon } from "lucide-react";
import type { FC } from "react";
import type { ProvisionerDaemon } from "#/api/typesGenerated";
import { Badge } from "#/components/Badge/Badge";
import { Button } from "#/components/Button/Button";
import { Checkbox } from "#/components/Checkbox/Checkbox";
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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { docs } from "#/utils/docs";
import { LastConnectionHead } from "./LastConnectionHead";
import { ProvisionerRow } from "./ProvisionerRow";

type ProvisionersFilter = {
	ids: string;
	offline: boolean;
};

interface OrganizationProvisionersPageViewProps {
	showPaywall: boolean | undefined;
	provisioners: readonly ProvisionerDaemon[] | undefined;
	buildVersion: string | undefined;
	error: unknown;
	filter: ProvisionersFilter;
	onRetry: () => void;
	onFilterChange: (filter: ProvisionersFilter) => void;
}

export const OrganizationProvisionersPageView: FC<
	OrganizationProvisionersPageViewProps
> = ({
	showPaywall,
	error,
	provisioners,
	buildVersion,
	filter,
	onFilterChange,
	onRetry,
}) => {
	return (
		<section className="w-full max-w-screen-2xl pb-10">
			<SettingsHeader>
				<SettingsHeaderTitle>供应商</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					Coder 服务器运行供应程序守护进程，这些守护进程在工作区和模板构建期间执行 Terraform。{" "}
					<Link href={docs("/admin/provisioners")}>查看文档</Link>
				</SettingsHeaderDescription>
			</SettingsHeader>

			{filter.ids && (
				<div className="flex items-center gap-2 mb-6">
					<div className="relative">
						<Badge className="h-10 text-sm pl-3 pr-10 font-mono">
							{filter.ids}
						</Badge>
						<div className="size-10 flex items-center justify-center absolute top-0 right-0">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="subtle"
										onClick={() => {
											onFilterChange({ ...filter, ids: "" });
										}}
									>
										<span className="sr-only">清除 ID</span>
										<XIcon />
									</Button>
								</TooltipTrigger>
								<TooltipContent>清除 ID</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</div>
			)}

			{showPaywall ? (
				<PaywallPremium
					message="供应商"
					description="供应商运行您的 Terraform 来创建模板和工作区。您需要 Premium 许可证才能为多个组织使用此功能。"
					documentationLink={docs("/admin/provisioners")}
				/>
			) : (
				<>
					<div className="flex items-center gap-2 mb-6">
						<Checkbox
							id="offline-filter"
							checked={filter.offline}
							onCheckedChange={(checked) => {
								onFilterChange({
									...filter,
									offline: checked === true,
								});
							}}
						/>
						<label
							htmlFor="offline-filter"
							className="text-sm font-medium leading-none"
						>
							包括离线供应商
						</label>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>名称</TableHead>
								<TableHead>密钥</TableHead>
								<TableHead>版本</TableHead>
								<TableHead>状态</TableHead>
								<TableHead>标签</TableHead>
								<TableHead>
									<LastConnectionHead />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{provisioners ? (
								provisioners.length > 0 ? (
									provisioners.map((provisioner) => (
										<ProvisionerRow
											provisioner={provisioner}
											key={provisioner.id}
											buildVersion={buildVersion}
											defaultIsOpen={filter.ids.includes(provisioner.id)}
										/>
									))
								) : (
									<TableRow>
										<TableCell colSpan={999}>
											<EmptyState
												message="未找到供应商"
												description="在创建模板和工作区之前，需要一个供应商。您可以按照我们的文档连接第一个供应商。"
												cta={
													<Button size="sm" asChild>
														<Link href={docs("/admin/provisioners")}>
															创建供应商
														</Link>
													</Button>
												}
											/>
										</TableCell>
									</TableRow>
								)
							) : error ? (
								<TableRow>
									<TableCell colSpan={999}>
										<EmptyState
											message="加载供应商作业时出错"
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
				</>
			)}
		</section>
	);
};
