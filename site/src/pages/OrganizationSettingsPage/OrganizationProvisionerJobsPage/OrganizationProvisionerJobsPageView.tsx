import { XIcon } from "lucide-react";
import type { FC } from "react";
import type {
	Organization,
	ProvisionerJob,
	ProvisionerJobStatus,
} from "#/api/typesGenerated";
import { Badge } from "#/components/Badge/Badge";
import { Button } from "#/components/Button/Button";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Link } from "#/components/Link/Link";
import { Loader } from "#/components/Loader/Loader";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	StatusIndicator,
	StatusIndicatorDot,
	type StatusIndicatorProps,
} from "#/components/StatusIndicator/StatusIndicator";
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
import { pageTitle } from "#/utils/page";
import { JobRow } from "./JobRow";

const variantByStatus: Record<
	ProvisionerJobStatus,
	StatusIndicatorProps["variant"]
> = {
	succeeded: "success",
	failed: "failed",
	pending: "pending",
	running: "pending",
	canceling: "pending",
	canceled: "inactive",
	unknown: "inactive",
};

const StatusFilters: ProvisionerJobStatus[] = [
	"succeeded",
	"pending",
	"running",
	"canceling",
	"canceled",
	"failed",
	"unknown",
];

const statusLabels: Record<ProvisionerJobStatus, string> = {
	succeeded: "成功",
	failed: "失败",
	pending: "待处理",
	running: "运行中",
	canceling: "取消中",
	canceled: "已取消",
	unknown: "未知",
};

type JobProvisionersFilter = {
	status: string;
	ids: string;
};

type OrganizationProvisionerJobsPageViewProps = {
	jobs: ProvisionerJob[] | undefined;
	organization: Organization | undefined;
	error: unknown;
	filter: JobProvisionersFilter;
	onRetry: () => void;
	onFilterChange: (filter: JobProvisionersFilter) => void;
};

const OrganizationProvisionerJobsPageView: FC<
	OrganizationProvisionerJobsPageViewProps
> = ({ jobs, organization, error, filter, onFilterChange, onRetry }) => {
	if (!organization) {
		return (
			<>
				<title>{pageTitle("配置器任务")}</title>

				<EmptyState message="未找到组织" />
			</>
		);
	}

	return (
		<div className="w-full max-w-screen-2xl pb-10">
			<title>
				{pageTitle(
					"配置器任务",
					organization.display_name || organization.name,
				)}
			</title>

			<section>
				<SettingsHeader>
					<SettingsHeaderTitle>配置器任务</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						配置器任务是构建工作空间时分配给配置器的单个任务。{" "}
						<Link href={docs("/admin/provisioners")}>查看文档</Link>
					</SettingsHeaderDescription>
				</SettingsHeader>

				<div className="flex items-center gap-2">
					{filter.ids && (
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
					)}

					<Select
						value={filter.status}
						onValueChange={(status) => {
							onFilterChange({
								...filter,
								status,
							});
						}}
					>
						<SelectTrigger className="w-[180px]" data-testid="status-filter">
							<SelectValue placeholder="所有状态" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{StatusFilters.map((status) => (
									<SelectItem key={status} value={status}>
										<StatusIndicator variant={variantByStatus[status]}>
											<StatusIndicatorDot />
											<span className="block first-letter:uppercase">
												{statusLabels[status]}
											</span>
										</StatusIndicator>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<Table className="mt-6">
					<TableHeader>
						<TableRow>
							<TableHead>创建时间</TableHead>
							<TableHead>类型</TableHead>
							<TableHead>模板</TableHead>
							<TableHead>标签</TableHead>
							<TableHead>状态</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobs ? (
							jobs.length > 0 ? (
								jobs.map((j) => (
									<JobRow
										defaultIsOpen={filter.ids.includes(j.id)}
										key={j.id}
										job={j}
									/>
								))
							) : (
								<TableRow>
									<TableCell colSpan={999}>
										<EmptyState message="未找到配置器任务" />
									</TableCell>
								</TableRow>
							)
						) : error ? (
							<TableRow>
								<TableCell colSpan={999}>
									<EmptyState
										message="加载配置器任务出错"
										cta={
											<Button size="sm" onClick={onRetry}>
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
			</section>
		</div>
	);
};

export default OrganizationProvisionerJobsPageView;
