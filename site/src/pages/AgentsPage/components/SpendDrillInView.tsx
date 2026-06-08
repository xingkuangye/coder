import type { FC } from "react";

import { getErrorMessage } from "#/api/errors";
import type * as TypesGen from "#/api/typesGenerated";
import { AvatarData } from "#/components/Avatar/AvatarData";
import { Button } from "#/components/Button/Button";
import {
	DateRangePicker,
	type DateRangeValue,
} from "#/components/DateRangePicker/DateRangePicker";
import { Spinner } from "#/components/Spinner/Spinner";
import { BackButton } from "./BackButton";
import { ChatCostSummaryView } from "./ChatCostSummaryView";
import { SectionHeader } from "./SectionHeader";

interface SpendDrillInViewProps {
	selectedUser: TypesGen.User | null;
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	onRetry: () => void;
	onBack: () => void;
	displayDateRange: DateRangeValue;
	onDateRangeChange: (value: DateRangeValue) => void;
	dateRangeLabel: string;
	summaryData: TypesGen.ChatCostSummary | undefined;
	isSummaryLoading: boolean;
	summaryError: unknown;
	onSummaryRetry: () => void;
}

export const SpendDrillInView: FC<SpendDrillInViewProps> = ({
	selectedUser,
	isLoading,
	isError,
	error,
	onRetry,
	onBack,
	displayDateRange,
	onDateRangeChange,
	dateRangeLabel,
	summaryData,
	isSummaryLoading,
	summaryError,
	onSummaryRetry,
}) => {
	const backButton = <BackButton onClick={onBack} />;

	const header = (
		<SectionHeader
			label="支出管理"
			description="查看特定用户的支出明细。"
			action={
				<DateRangePicker
					value={displayDateRange}
					onChange={onDateRangeChange}
				/>
			}
		/>
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					{backButton}
					{header}
				</div>
				<div
					role="status"
					aria-label="正在加载用户详情"
					className="flex min-h-[240px] items-center justify-center"
				>
					<Spinner size="lg" loading className="text-content-secondary" />
				</div>
			</div>
		);
	}

	if (isError || !selectedUser) {
		return (
			<div className="space-y-6">
				<div>
					{backButton}
					{header}
				</div>
				<div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
					<p className="m-0 text-sm text-content-secondary">
						{getErrorMessage(error, "加载用户资料失败。")}
					</p>
					<Button variant="outline" size="sm" type="button" onClick={onRetry}>
						重试
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				{backButton}
				{header}
			</div>
			<div className="flex items-center justify-between rounded-lg bg-surface-secondary px-4 py-3">
				<AvatarData
					title={selectedUser.name || selectedUser.username}
					subtitle={`@${selectedUser.username}`}
					src={selectedUser.avatar_url}
					imgFallbackText={selectedUser.username}
				/>
				<div className="min-w-0 text-xs text-content-secondary">
					<div>用户ID：{selectedUser.id}</div>
					<div>{dateRangeLabel}</div>
				</div>
			</div>
			<ChatCostSummaryView
				key={selectedUser.id}
				summary={summaryData}
				isLoading={isSummaryLoading}
				error={summaryError}
				onRetry={onSummaryRetry}
				loadingLabel="正在加载使用详情"
				emptyMessage="所选时间段内此用户无使用数据。"
			/>
		</div>
	);
};
