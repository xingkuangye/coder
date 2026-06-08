import dayjs from "dayjs";
import {
	AppWindowIcon,
	CircleAlertIcon,
	CloudDownloadIcon,
	CloudUploadIcon,
	GaugeIcon,
	GitCompareArrowsIcon,
	RotateCwIcon,
	WrenchIcon,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import {
	type FC,
	type PropsWithChildren,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Link as RouterLink } from "react-router";
import type {
	DeploymentStats,
	HealthcheckReport,
	WorkspaceStatus,
} from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { HelpPopoverTitle } from "#/components/HelpPopover/HelpPopover";
import { JetBrainsIcon } from "#/components/Icons/JetBrainsIcon";
import { RocketIcon } from "#/components/Icons/RocketIcon";
import { TerminalIcon } from "#/components/Icons/TerminalIcon";
import { VSCodeIcon } from "#/components/Icons/VSCodeIcon";
import { Link } from "#/components/Link/Link";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { getDisplayWorkspaceStatus } from "#/utils/workspace";

interface DeploymentBannerViewProps {
	health?: HealthcheckReport;
	stats?: DeploymentStats;
	fetchStats?: () => void;
}

export const DeploymentBannerView: FC<DeploymentBannerViewProps> = ({
	health,
	stats,
	fetchStats,
}) => {
	const aggregatedMinutes = useMemo(() => {
		if (!stats) {
			return;
		}
		return dayjs(stats.collected_at).diff(stats.aggregated_from, "minutes");
	}, [stats]);

	const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);
	useEffect(() => {
		if (!stats || !fetchStats) {
			return;
		}

		let timeUntilRefresh = dayjs(stats.next_update_at).diff(
			stats.collected_at,
			"seconds",
		);
		setTimeUntilRefresh(timeUntilRefresh);
		let canceled = false;
		const loop = () => {
			if (canceled) {
				return undefined;
			}
			setTimeUntilRefresh(timeUntilRefresh--);
			if (timeUntilRefresh > 0) {
				return window.setTimeout(loop, 1000);
			}
			fetchStats();
		};
		const timeout = setTimeout(loop, 1000);
		return () => {
			canceled = true;
			clearTimeout(timeout);
		};
	}, [fetchStats, stats]);

	// biome-ignore lint/correctness/useExhaustiveDependencies(timeUntilRefresh): periodic refresh
	const lastAggregated = useMemo(() => {
		if (!stats) {
			return;
		}
		if (!fetchStats) {
			// Storybook!
			return "刚刚";
		}
		return dayjs().to(dayjs(stats.collected_at));
	}, [timeUntilRefresh, stats, fetchStats]);

	const healthErrors = health ? getHealthErrors(health) : [];
	const displayLatency = stats?.workspaces.connection_latency_ms.P50 || -1;

	return (
		<div
			className="sticky bottom-0 z-[1] flex h-9 w-full items-center gap-8
		 		overflow-x-auto overflow-y-hidden whitespace-nowrap border-0 border-t border-solid border-border
				bg-surface-primary pr-4 font-mono text-xs leading-none"
		>
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild>
						{healthErrors.length > 0 ? (
							<Link
								asChild
								className="flex p-3 bg-content-destructive"
								showExternalIcon={false}
							>
								<RouterLink
									to="/health"
									data-testid="deployment-health-trigger"
								>
									<CircleAlertIcon className="text-content-primary" />
								</RouterLink>
							</Link>
						) : (
							<div
								className="flex h-full items-center justify-center pl-3"
								data-testid="deployment-health-trigger"
							>
								<RocketIcon className="size-icon-sm" />
							</div>
						)}
					</TooltipTrigger>
					<TooltipContent
						className="ml-3 mb-1 p-4 text-sm text-content-primary
							border border-solid border-border pointer-events-none"
					>
						{healthErrors.length > 0 ? (
							<>
								<HelpPopoverTitle>
									我们检测到您的 Coder 部署存在问题。
								</HelpPopoverTitle>
								<div className="flex flex-col gap-1">
									{healthErrors.map((error) => (
										<HealthIssue key={error}>{error}</HealthIssue>
									))}
								</div>
							</>
						) : (
							"您的 Coder 部署状态。仅管理员可见！"
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<div className="flex items-center">
				<div className="mr-4 text-content-primary">工作区</div>
				<div className="flex gap-2 text-content-secondary">
					<WorkspaceBuildValue
						status="pending"
						count={stats?.workspaces.pending}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="starting"
						count={stats?.workspaces.building}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="running"
						count={stats?.workspaces.running}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="stopped"
						count={stats?.workspaces.stopped}
					/>
					<ValueSeparator />
					<WorkspaceBuildValue
						status="failed"
						count={stats?.workspaces.failed}
					/>
				</div>
			</div>

			<div className="flex items-center">
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="mr-4 text-content-primary">传输</div>
						</TooltipTrigger>
						<TooltipContent>
							{`最近大约 ${aggregatedMinutes} 分钟的活动`}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<div className="flex gap-2 text-content-secondary">
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<CloudDownloadIcon className="size-icon-xs" />
									{stats ? prettyBytes(stats.workspaces.rx_bytes) : "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>发送到工作区的数据</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<CloudUploadIcon className="size-icon-xs" />
									{stats ? prettyBytes(stats.workspaces.tx_bytes) : "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>从工作区发送的数据</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<GaugeIcon className="size-icon-xs" />
									{displayLatency > 0
										? `${displayLatency?.toFixed(2)} ms`
										: "-"}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{displayLatency < 0
									? "最近没有建立工作区连接"
									: "用户连接工作区的平均延迟"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="flex items-center">
				<div className="mr-4 text-content-primary">活动连接</div>

				<div className="flex gap-2 text-content-secondary">
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<VSCodeIcon className="size-icon-xs [&_*]:fill-current" />
									{typeof stats?.session_count.vscode === "undefined"
										? "-"
										: stats?.session_count.vscode}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								带有 Coder 远程扩展的 VS Code 编辑器
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<JetBrainsIcon className="size-icon-xs [&_*]:fill-current" />
									{typeof stats?.session_count.jetbrains === "undefined"
										? "-"
										: stats?.session_count.jetbrains}
								</div>
							</TooltipTrigger>
							<TooltipContent>JetBrains 编辑器</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<TerminalIcon className="size-icon-xs" />
									{typeof stats?.session_count.ssh === "undefined"
										? "-"
										: stats?.session_count.ssh}
								</div>
							</TooltipTrigger>
							<TooltipContent>SSH 会话</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ValueSeparator />
					<TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1">
									<AppWindowIcon className="size-icon-xs" />
									{typeof stats?.session_count.reconnecting_pty === "undefined"
										? "-"
										: stats?.session_count.reconnecting_pty}
								</div>
							</TooltipTrigger>
							<TooltipContent>Web 终端会话</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="ml-auto flex mr-3 items-center gap-8 text-content-primary">
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-1">
								<GitCompareArrowsIcon className="size-icon-xs" />
								{lastAggregated}
							</div>
						</TooltipTrigger>
						<TooltipContent
							className="max-w-xs"
							collisionPadding={{ right: 20 }}
						>
							上次聚合统计数据的时间。工作区会定期报告统计信息，因此更新可能需要一些时间！
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="font-mono [&_svg]:mr-1"
								onClick={() => {
									if (fetchStats) {
										fetchStats();
									}
								}}
								variant="subtle"
								size="icon"
							>
								<RotateCwIcon />
								{timeUntilRefresh}秒
							</Button>
						</TooltipTrigger>
						<TooltipContent
							className="max-w-xs"
							collisionPadding={{ right: 20 }}
						>
							距离再次获取统计数据的倒计时。点击刷新！
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
};

interface WorkspaceBuildValueProps {
	status: WorkspaceStatus;
	count?: number;
}

const WorkspaceBuildValue: FC<WorkspaceBuildValueProps> = ({
	status,
	count,
}) => {
	const displayStatus = getDisplayWorkspaceStatus(status);
	let statusText: string;
	switch (status) {
		case "pending":
			statusText = "待处理";
			break;
		case "starting":
			statusText = "构建中";
			break;
		case "running":
			statusText = "运行中";
			break;
		case "stopped":
			statusText = "已停止";
			break;
		case "failed":
			statusText = "失败";
			break;
		default:
			statusText = displayStatus.text;
	}
	let icon = displayStatus.icon;

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Link asChild showExternalIcon={false}>
						<RouterLink
							to={`/workspaces?filter=${encodeURIComponent(`status:${status}`)}`}
						>
							<div className="flex items-center gap-1 text-xs">
								{icon}
								{typeof count === "undefined" ? "-" : count}
							</div>
						</RouterLink>
					</Link>
				</TooltipTrigger>
				<TooltipContent>{`${statusText} 工作区`}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const ValueSeparator: FC = () => {
	return <div className="text-content-disabled self-center">/</div>;
};

const HealthIssue: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex items-center gap-1">
			<CircleAlertIcon className="size-icon-sm text-border-destructive" />
			{children}
		</div>
	);
};

const getHealthErrors = (health: HealthcheckReport) => {
	const warnings: string[] = [];
	const sections = [
		"access_url",
		"database",
		"derp",
		"websocket",
		"workspace_proxy",
	] as const;
	const messages: Record<(typeof sections)[number], string> = {
		access_url: "您的访问 URL 可能配置不正确。",
		database: "您的数据库不健康。",
		derp: "我们检测到 DERP 代理问题。",
		websocket: "我们检测到 websocket 问题。",
		workspace_proxy: "我们检测到工作区代理问题。",
	} as const;

	for (const section of sections) {
		if (health[section].severity === "error" && !health[section].dismissed) {
			warnings.push(messages[section]);
		}
	}

	return warnings;
};
