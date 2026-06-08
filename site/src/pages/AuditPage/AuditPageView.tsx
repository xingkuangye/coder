import type { ComponentProps, FC } from "react";
import type { AuditLog } from "#/api/typesGenerated";
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
import { AuditFilter } from "./AuditFilter";
import { AuditHelpPopover } from "./AuditHelpPopover";
import { AuditLogRow } from "./AuditLogRow/AuditLogRow";

interface AuditPageViewProps {
	auditLogs?: readonly AuditLog[];
	isNonInitialPage: boolean;
	isAuditLogVisible: boolean;
	error?: unknown;
	filterProps: ComponentProps<typeof AuditFilter>;
	auditsQuery: PaginationResult;
	showOrgDetails: boolean;
}

export const AuditPageView: FC<AuditPageViewProps> = ({
	auditLogs,
	isNonInitialPage,
	isAuditLogVisible,
	error,
	filterProps,
	auditsQuery: paginationResult,
	showOrgDetails,
}) => {
	const isLoading =
		(auditLogs === undefined || paginationResult.totalRecords === undefined) &&
		!error;

	const isEmpty = !isLoading && auditLogs?.length === 0;

	return (
		<Margins className="pb-12">
			<PageHeader>
				<PageHeaderTitle>
					<div className="flex flex-row gap-2 items-center">
						<span>审计</span>
						<AuditHelpPopover />
					</div>
				</PageHeaderTitle>
				<PageHeaderSubtitle>查看审计日志中的事件。</PageHeaderSubtitle>
			</PageHeader>

			{isAuditLogVisible ? (
				<>
					<AuditFilter {...filterProps} />

					<PaginationContainer
						query={paginationResult}
						paginationUnitLabel="审计日志"
					>
						<Table>
							<TableBody>
								<AuditTableBody
									auditLogs={auditLogs}
									error={error}
									isLoading={isLoading}
									isEmpty={isEmpty}
									isNonInitialPage={isNonInitialPage}
									showOrgDetails={showOrgDetails}
								/>
							</TableBody>
						</Table>
					</PaginationContainer>
				</>
			) : (
				<PaywallPremium
					message="审计日志"
					description="审计日志允许您监控部署上的用户操作。您需要高级许可证才能使用此功能。"
					documentationLink={docs("/admin/security/audit-logs")}
				/>
			)}
		</Margins>
	);
};

interface AuditTableBodyProps {
	auditLogs: readonly AuditLog[] | undefined;
	error: unknown;
	isLoading: boolean;
	isEmpty: boolean;
	isNonInitialPage: boolean;
	showOrgDetails: boolean;
}

const AuditTableBody: FC<AuditTableBodyProps> = ({
	auditLogs,
	error,
	isLoading,
	isEmpty,
	isNonInitialPage,
	showOrgDetails,
}) => {
	// An error renders as an empty table.
	if (error) {
		return (
			<TableRow>
				<TableCell colSpan={999}>
					<EmptyState message="加载审计日志时发生错误" />
				</TableCell>
			</TableRow>
		);
	}
	if (isLoading) {
		return <TableLoader />;
	}
	if (isEmpty) {
		const emptyMessage = isNonInitialPage
			? "当前页面没有审计日志"
			: "没有审计日志";
		return (
			<TableRow>
				<TableCell colSpan={999}>
					<EmptyState message={emptyMessage} />
				</TableCell>
			</TableRow>
		);
	}
	if (!auditLogs) {
		return null;
	}
	return (
		<Timeline
			items={auditLogs}
			getDate={(log) => new Date(log.time)}
			row={(log) => (
				<AuditLogRow
					key={log.id}
					auditLog={log}
					showOrgDetails={showOrgDetails}
				/>
			)}
		/>
	);
};
