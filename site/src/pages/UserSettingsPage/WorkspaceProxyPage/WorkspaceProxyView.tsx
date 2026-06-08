import type { FC } from "react";
import type { Region } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableEmpty } from "#/components/TableEmpty/TableEmpty";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import type { ProxyLatencyReport } from "#/contexts/useProxyLatency";
import { ProxyRow } from "./WorkspaceProxyRow";

interface WorkspaceProxyViewProps {
	proxies?: readonly Region[];
	proxyLatencies?: Record<string, ProxyLatencyReport>;
	getWorkspaceProxiesError?: unknown;
	isLoading: boolean;
	hasLoaded: boolean;
	preferredProxy?: Region;
	selectProxyError?: unknown;
}

export const WorkspaceProxyView: FC<WorkspaceProxyViewProps> = ({
	proxies,
	proxyLatencies,
	getWorkspaceProxiesError,
	isLoading,
	hasLoaded,
	selectProxyError,
}) => {
	return (
		<div className="flex flex-col gap-4">
			<SettingsHeader>
				<SettingsHeaderTitle>工作区代理</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					工作区代理可以改善终端和 Web 应用到工作区的连接。
				</SettingsHeaderDescription>
			</SettingsHeader>

			{Boolean(getWorkspaceProxiesError) && (
				<ErrorAlert error={getWorkspaceProxiesError} />
			)}
			{Boolean(selectProxyError) && <ErrorAlert error={selectProxyError} />}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[60%]">代理</TableHead>
						<TableHead className="w-[20%]">状态</TableHead>
						<TableHead className="w-[20%]">延迟</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<ProxiesTableBody
						proxies={proxies}
						proxyLatencies={proxyLatencies}
						isLoading={isLoading}
						hasLoaded={hasLoaded}
					/>
				</TableBody>
			</Table>
		</div>
	);
};

interface ProxiesTableBodyProps {
	proxies?: readonly Region[];
	proxyLatencies?: Record<string, ProxyLatencyReport>;
	isLoading: boolean;
	hasLoaded: boolean;
}

const ProxiesTableBody: FC<ProxiesTableBodyProps> = ({
	proxies,
	proxyLatencies,
	isLoading,
	hasLoaded,
}) => {
	if (isLoading) {
		return <TableLoader />;
	}
	if (hasLoaded && proxies?.length === 0) {
		return <TableEmpty message="未找到工作区代理" />;
	}
	return (
		<>
			{proxies?.map((proxy) => (
				<ProxyRow
					latency={proxyLatencies?.[proxy.id]}
					key={proxy.id}
					proxy={proxy}
				/>
			))}
		</>
	);
};
