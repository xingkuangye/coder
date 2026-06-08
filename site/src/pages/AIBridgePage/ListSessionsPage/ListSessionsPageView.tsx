import { InfoIcon } from "lucide-react";
import type { ComponentProps, FC, PropsWithChildren } from "react";
import type { AIBridgeSession } from "#/api/typesGenerated";
import {
	PaginationContainer,
	type PaginationResult,
} from "#/components/PaginationWidget/PaginationContainer";
import { PaywallAIGovernance } from "#/components/Paywall/PaywallAIGovernance";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableEmpty } from "#/components/TableEmpty/TableEmpty";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { DATE_FORMAT, formatDateTime } from "#/utils/time";
import { AIBridgeSetupAlert } from "../AIBridgeSetupAlert";
import { ListSessionsFilter } from "./ListSessionsFilter";
import { ListSessionsRow } from "./ListSessionsRow";

interface ListSessionsPageViewProps {
	isLoading: boolean;
	isFetching: boolean;
	isAISessionsEntitled: boolean;
	isAISessionsEnabled: boolean;
	sessions?: readonly AIBridgeSession[];
	sessionsQuery: PaginationResult;
	filterProps: ComponentProps<typeof ListSessionsFilter>;
	onSessionRowClick?: (sessionId: string) => void;
}

const ThreadTooltip: FC<PropsWithChildren> = ({ children }) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent
				side="top"
				align="end"
				className="max-w-xs text-sm font-normal"
			>
				线程是人机之间的多轮交互，包括初始的人类提示和随后的智能体循环。
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export const ListSessionsPageView: FC<ListSessionsPageViewProps> = ({
	isLoading,
	isFetching,
	isAISessionsEntitled,
	isAISessionsEnabled,
	sessions,
	sessionsQuery,
	filterProps,
	onSessionRowClick,
}) => {
	if (!isAISessionsEntitled) {
		return <PaywallAIGovernance />;
	}

	if (!isAISessionsEnabled) {
		return <AIBridgeSetupAlert />;
	}

	const utcOffset = formatDateTime(new Date(), DATE_FORMAT.UTC_OFFSET);

	return (
		<>
			<ListSessionsFilter {...filterProps} />

			<PaginationContainer query={sessionsQuery} paginationUnitLabel="会话">
				<Table className="text-sm font-normal">
					<TableHeader>
						<TableRow>
							<TableHead className="text-nowrap">最近提示</TableHead>
							<TableHead className="text-nowrap">用户</TableHead>
							<TableHead className="text-nowrap">提供商</TableHead>
							<TableHead className="text-nowrap">客户端</TableHead>
							<TableHead className="text-nowrap">输入/输出令牌</TableHead>
							<TableHead className="flex items-center flex-nowrap gap-1">
								线程
								<ThreadTooltip>
									<InfoIcon className="size-icon-xs" />
								</ThreadTooltip>
							</TableHead>
							<TableHead className="text-nowrap">
								最近提示时间 [UTC{utcOffset}]
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading || isFetching ? (
							<TableLoader />
						) : sessions?.length === 0 ? (
							<TableEmpty message="没有可用的会话日志" />
						) : (
							sessions?.map((session) => (
								<ListSessionsRow
									session={session}
									key={session.id}
									onClick={() => onSessionRowClick?.(session.id)}
								/>
							))
						)}
					</TableBody>
				</Table>
			</PaginationContainer>
		</>
	);
};
