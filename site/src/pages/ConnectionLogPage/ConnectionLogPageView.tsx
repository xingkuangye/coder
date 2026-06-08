import type { ComponentProps, FC } from "react";
import type { ConnectionLog } from "#/api/typesGenerated";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Margins } from "#/components/Margins/Margins";
import {
	PageHeader,
	PageHeaderSubtitle,
	PageHeaderTitle,
} from "#/components/PageHeader/PageHeader";
import {
	PaginationContainer,
	type PaginationResult,
} from "#/components/PaginationWidget/PaginationContainer";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "#/components/Table/Table";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import { Timeline } from "#/components/Timeline/Timeline";
import { docs } from "#/utils/docs";
import { ConnectionLogFilter } from "./ConnectionLogFilter";
import { ConnectionLogHelpPopover } from "./ConnectionLogHelpPopover";
import { ConnectionLogRow } from "./ConnectionLogRow/ConnectionLogRow";

interface ConnectionLogPageViewProps {
	connectionLogs?: readonly ConnectionLog[];
	isNonInitialPage: boolean;
	isConnectionLogVisible: boolean;
	error?: unknown;
	filterProps: ComponentProps<typeof ConnectionLogFilter>;
	connectionLogsQuery: PaginationResult;
}

export const ConnectionLogPageView: FC<ConnectionLogPageViewProps> = ({
	connectionLogs,
	isNonInitialPage,
	isConnectionLogVisible,
	error,
	filterProps,
	connectionLogsQuery: paginationResult,
}) => {
	const isLoading =
		(connectionLogs === undefined ||
			paginationResult.totalRecords === undefined) &&
		!error;

	const isEmpty = !isLoading && connectionLogs?.length === 0;

	return (
		<Margins className="pb-12">
			<PageHeader>
				<PageHeaderTitle>
					<div className="flex flex-row gap-2 items-center">
						<span>连接日志</span>
						<ConnectionLogHelpPopover />
					</div>
				</PageHeaderTitle>
				<PageHeaderSubtitle>
					查看工作区连接事件。
				</PageHeaderSubtitle>
			</PageHeader>

			{isConnectionLogVisible ? (
				<>
					<ConnectionLogFilter {...filterProps} />

					<PaginationContainer
						query={paginationResult}
						paginationUnitLabel="条日志"
					>
						<Table>
							<TableBody>
								<ConnectionLogTableBody
									connectionLogs={connectionLogs}
									error={error}
									isLoading={isLoading}
									isEmpty={isEmpty}
									isNonInitialPage={isNonInitialPage}
								/>
							</TableBody>
						</Table>
					</PaginationContainer>
				</>
			) : (
				<PaywallPremium
					message="连接日志"
					description="连接日志可让您查看用户连接工作区的方式和时间。您需要 Premium 许可证才能使用此功能。"
					documentationLink={docs("/admin/monitoring/connection-logs")}
				/>
			)}
		</Margins>
	);
};

interface ConnectionLogTableBodyProps {
	connectionLogs: readonly ConnectionLog[] | undefined;
	error: unknown;
	isLoading: boolean;
	isEmpty: boolean;
	isNonInitialPage: boolean;
}

const ConnectionLogTableBody: FC<ConnectionLogTableBodyProps> = ({
	connectionLogs,
	error,
	isLoading,
	isEmpty,
	isNonInitialPage,
}) => {
	// An error renders as an empty table.
	if (error) {
		return (
			<TableRow>
				<TableCell colSpan={999}>
					<EmptyState message="加载连接日志时发生错误" />
				</TableCell>
			</TableRow>
		);
	}
	if (isLoading) {
		return <TableLoader />;
	}
	if (isEmpty) {
		const emptyMessage = isNonInitialPage
			? "此页上没有可用的连接日志"
			: "没有可用的连接日志";
		return (
			<TableRow>
				<TableCell colSpan={999}>
					<EmptyState message={emptyMessage} />
				</TableCell>
			</TableRow>
		);
	}
	if (!connectionLogs) {
		return null;
	}
	return (
		<Timeline
			items={connectionLogs}
			getDate={(log) => new Date(log.connect_time)}
			row={(log) => <ConnectionLogRow key={log.id} connectionLog={log} />}
		/>
	);
};
