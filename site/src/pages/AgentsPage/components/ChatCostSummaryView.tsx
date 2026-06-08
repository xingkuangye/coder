import dayjs from "dayjs";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { type FC, useState } from "react";
import { getErrorMessage } from "#/api/errors";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { PaginationWidgetBase } from "#/components/PaginationWidget/PaginationWidgetBase";
import { Spinner } from "#/components/Spinner/Spinner";
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
import { formatTokenCount } from "#/utils/analytics";
import { formatCostMicros } from "#/utils/currency";
import { paginateItems } from "#/utils/paginateItems";

interface ChatCostSummaryViewProps {
	summary: TypesGen.ChatCostSummary | undefined;
	isLoading: boolean;
	error: unknown;
	onRetry: () => void;
	loadingLabel: string;
	emptyMessage: string;
}

export const getUsageLimitPeriodLabel = (
	period: TypesGen.ChatUsageLimitPeriod | undefined,
): string => {
	if (!period) {
		return "";
	}

	switch (period) {
		case "day":
			return "每日";
		case "week":
			return "每周";
		case "month":
			return "每月";
		default:
			return "";
	}
};

export const ChatCostSummaryView: FC<ChatCostSummaryViewProps> = ({
	summary,
	isLoading,
	error,
	onRetry,
	loadingLabel,
	emptyMessage,
}) => {
	// Page state is intentionally not reset when summary data changes.
	// The clamped derivation below guarantees the displayed page is
	// always valid, and preserving the raw state lets the user return
	// to their previous page if they widen the date range back.
	const [modelPage, setModelPage] = useState(1);
	const [chatPage, setChatPage] = useState(1);

	if (isLoading) {
		return (
			<div
				role="status"
				aria-label={loadingLabel}
				className="flex min-h-[240px] items-center justify-center"
			>
				<Spinner size="lg" loading />
			</div>
		);
	}

	if (error != null) {
		return (
			<div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
				<p className="m-0 text-sm text-content-secondary">
					{getErrorMessage(error, "加载使用详情失败。")}
				</p>
				<Button variant="outline" size="sm" type="button" onClick={onRetry}>
					重试
				</Button>
			</div>
		);
	}

	if (!summary) {
		return null;
	}

	const modelPageSize = 10;
	const {
		pagedItems: pagedModels,
		clampedPage: clampedModelPage,
		hasPreviousPage: hasModelPrev,
		hasNextPage: hasModelNext,
	} = paginateItems(summary.by_model, modelPageSize, modelPage);
	const chatPageSize = 10;
	const {
		pagedItems: pagedChats,
		clampedPage: clampedChatPage,
		hasPreviousPage: hasChatPrev,
		hasNextPage: hasChatNext,
	} = paginateItems(summary.by_chat, chatPageSize, chatPage);

	const usageLimit = summary.usage_limit;
	const showUsageLimitCard = usageLimit?.is_limited === true;
	const usageLimitCurrentSpend = usageLimit?.current_spend ?? 0;
	const usageLimitSpendMicros = usageLimit?.spend_limit_micros ?? 0;
	const usageLimitPeriodLabel = usageLimit
		? getUsageLimitPeriodLabel(usageLimit.period)
		: "";
	const usageProgressPercentage =
		showUsageLimitCard && usageLimitSpendMicros > 0
			? Math.min((usageLimitCurrentSpend / usageLimitSpendMicros) * 100, 100)
			: 0;
	const usageProgressBarClass =
		usageProgressPercentage > 90
			? "bg-content-destructive"
			: usageProgressPercentage >= 75
				? "bg-content-warning"
				: "bg-content-success";
	const usageLimitExceeded =
		showUsageLimitCard && usageLimitCurrentSpend >= usageLimitSpendMicros;
	const usageLimitStatusText = usageLimitExceeded
		? "限额已超出"
		: `${formatCostMicros(
				Math.max(usageLimitSpendMicros - usageLimitCurrentSpend, 0),
			)} 剩余`;
	const usageLimitCurrentPeriod =
		showUsageLimitCard && usageLimit?.period_start && usageLimit?.period_end
			? `当前周期：${dayjs(usageLimit.period_start).format("MMM D")} – ${dayjs(
					usageLimit.period_end,
				).format("MMM D")}`
			: "";
	const usageLimitResetAt =
		showUsageLimitCard && usageLimit?.period_end
			? dayjs(usageLimit.period_end).format("MMM D, YYYY h:mm A")
			: "";

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						总成本
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{formatCostMicros(summary.total_cost_micros)}
					</p>
				</div>
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						输入词元
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{formatTokenCount(summary.total_input_tokens)}
					</p>
				</div>
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						输出词元
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{formatTokenCount(summary.total_output_tokens)}
					</p>
				</div>
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						缓存读取
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{formatTokenCount(summary.total_cache_read_tokens)}
					</p>
				</div>
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						缓存写入
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{formatTokenCount(summary.total_cache_creation_tokens)}
					</p>
				</div>
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
						消息
					</p>
					<p className="mt-1 text-2xl font-semibold text-content-primary">
						{(
							summary.priced_message_count + summary.unpriced_message_count
						).toLocaleString()}
					</p>
				</div>
			</div>

			{showUsageLimitCard && usageLimit && (
				<div className="rounded-lg border border-border-default bg-surface-secondary p-4">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
							<div>
								<p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
									{usageLimitPeriodLabel} 消费限额
								</p>
								{usageLimitCurrentPeriod && (
									<p className="mt-1 text-sm text-content-secondary">
										{usageLimitCurrentPeriod}
									</p>
								)}
								<p className="mt-1 text-2xl font-semibold text-content-primary">
									{formatCostMicros(usageLimitCurrentSpend)} /{" "}
									{formatCostMicros(usageLimitSpendMicros)}
								</p>
							</div>
							<p className="text-sm text-content-secondary">
								{Math.round(usageProgressPercentage)}% 已使用
							</p>
						</div>
						<div
							role="progressbar"
							aria-label={`${usageLimitPeriodLabel} 消费使用情况`}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(usageProgressPercentage)}
							className="h-2 overflow-hidden rounded-full bg-surface-tertiary"
						>
							<div
								className={`h-full rounded-full ${usageProgressBarClass}`}
								style={{ width: `${usageProgressPercentage}%` }}
							/>
						</div>
						<div className="flex flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between">
							<p
								className={
									usageLimitExceeded
										? "text-content-destructive"
										: "text-content-secondary"
								}
							>
								{usageLimitStatusText}
							</p>
							<p className="text-content-secondary">
								重置时间 {usageLimitResetAt}
							</p>
						</div>
					</div>
				</div>
			)}

			{summary.unpriced_message_count > 0 && (
				<div className="flex items-start gap-3 rounded-lg border border-border-warning bg-surface-warning p-4 text-sm text-content-primary">
					<TriangleAlertIcon className="size-5 shrink-0 text-content-warning" />
					<span>
						{summary.unpriced_message_count} 条消息由于模型定价数据不可用而无法计算费用。
					</span>
				</div>
			)}

			<div className="flex items-start gap-3 p-4 text-sm text-content-secondary">
				<InfoIcon className="size-5 shrink-0" />
				<span>
					自动标题生成使用轻量级模型，不会计入使用额度。
				</span>
			</div>

			{summary.by_model.length === 0 && summary.by_chat.length === 0 ? (
				<p className="py-12 text-center text-content-secondary">
					{emptyMessage}
				</p>
			) : (
				<>
					<div>
						<Table aria-label="按模型划分的成本明细">
							<TableHeader>
								<TableRow>
									<TableHead>模型</TableHead>
									<TableHead>提供商</TableHead>
									<TableHead className="text-right">成本</TableHead>
									<TableHead className="text-right">消息</TableHead>
									<TableHead className="text-right">输入</TableHead>
									<TableHead className="text-right">输出</TableHead>
									<TableHead className="text-right">缓存读取</TableHead>
									<TableHead className="text-right">缓存写入</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pagedModels.map((model) => (
									<TableRow key={model.model_config_id}>
										<TableCell>{model.display_name || model.model}</TableCell>
										<TableCell className="text-content-secondary">
											{model.provider}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatCostMicros(model.total_cost_micros)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{model.message_count.toLocaleString()}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(model.total_input_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(model.total_output_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(model.total_cache_read_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(model.total_cache_creation_tokens)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{summary.by_model.length > modelPageSize && (
							<div className="pt-4">
								<PaginationWidgetBase
									totalRecords={summary.by_model.length}
									currentPage={clampedModelPage}
									pageSize={modelPageSize}
									onPageChange={setModelPage}
									hasPreviousPage={hasModelPrev}
									hasNextPage={hasModelNext}
								/>
							</div>
						)}
					</div>

					<div>
						<Table aria-label="按代理划分的成本明细">
							<TableHeader>
								<TableRow>
									<TableHead>代理</TableHead>
									<TableHead className="text-right">成本</TableHead>
									<TableHead className="text-right">消息</TableHead>
									<TableHead className="text-right">输入</TableHead>
									<TableHead className="text-right">输出</TableHead>
									<TableHead className="text-right">缓存读取</TableHead>
									<TableHead className="text-right">缓存写入</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pagedChats.map((chat) => (
									<TableRow key={chat.root_chat_id}>
										<TableCell className="max-w-[200px]">
											{chat.chat_title ? (
												<Tooltip>
													<TooltipTrigger asChild>
														<span className="block truncate">
															{chat.chat_title}
														</span>
													</TooltipTrigger>
													<TooltipContent>{chat.chat_title}</TooltipContent>
												</Tooltip>
											) : (
												<span className="text-content-secondary">
													未命名代理
												</span>
											)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatCostMicros(chat.total_cost_micros)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{chat.message_count.toLocaleString()}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(chat.total_input_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(chat.total_output_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(chat.total_cache_read_tokens)}
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatTokenCount(chat.total_cache_creation_tokens)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{summary.by_chat.length > chatPageSize && (
							<div className="pt-4">
								<PaginationWidgetBase
									totalRecords={summary.by_chat.length}
									currentPage={clampedChatPage}
									pageSize={chatPageSize}
									onPageChange={setChatPage}
									hasPreviousPage={hasChatPrev}
									hasNextPage={hasChatNext}
								/>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};
