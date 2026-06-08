import type { ComponentProps, FC } from "react";
import type { AIBridgeInterception } from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
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
import { AIBridgeSetupAlert } from "../AIBridgeSetupAlert";
import { RequestLogsFilter } from "./RequestLogsFilter/RequestLogsFilter";
import { RequestLogsRow } from "./RequestLogsRow/RequestLogsRow";

interface RequestLogsPageViewProps {
	isLoading: boolean;
	isRequestLogsEntitled: boolean;
	isRequestLogsEnabled: boolean;
	interceptions?: readonly AIBridgeInterception[];
	interceptionsQuery: PaginationResult;
	filterProps: ComponentProps<typeof RequestLogsFilter>;
}

export const RequestLogsPageView: FC<RequestLogsPageViewProps> = ({
	isLoading,
	isRequestLogsEntitled,
	isRequestLogsEnabled,
	interceptions,
	interceptionsQuery,
	filterProps,
}) => {
	if (!isRequestLogsEntitled) {
		return <PaywallAIGovernance />;
	}

	if (!isRequestLogsEnabled) {
		return <AIBridgeSetupAlert />;
	}

	return (
		<>
			<Alert severity="info" className="mb-4">
				访问新的{" "}
				<Link href="/aibridge/sessions" className="text-content-link italic">
					AI Sessions
				</Link>{" "}
				页面，以获取更全面的 AI 活动概览。
			</Alert>

			<RequestLogsFilter {...filterProps} />

			<PaginationContainer
				query={interceptionsQuery}
				paginationUnitLabel="条拦截记录"
			>
				<Table className="text-sm">
					<TableHeader>
						<TableRow className="text-xs">
							<TableHead>时间戳</TableHead>
							<TableHead>发起者</TableHead>
							<TableHead>令牌数</TableHead>
							<TableHead>客户端</TableHead>
							<TableHead>模型</TableHead>
							<TableHead>工具调用</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableLoader />
						) : interceptions?.length === 0 ? (
							<TableEmpty message="没有可用的请求日志" />
						) : (
							interceptions?.map((interception) => (
								<RequestLogsRow
									interception={interception}
									key={interception.id}
								/>
							))
						)}
					</TableBody>
				</Table>
			</PaginationContainer>
		</>
	);
};
