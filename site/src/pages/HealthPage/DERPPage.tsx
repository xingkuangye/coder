import { useTheme } from "@emotion/react";
import { MapPinIcon } from "lucide-react";
import type { FC } from "react";
import { Link, useOutletContext } from "react-router";
import type {
	HealthcheckReport,
	HealthSeverity,
	NetcheckReport,
} from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from "#/components/Table/Table";
import { pageTitle } from "#/utils/page";
import {
	Header,
	HeaderTitle,
	HealthMessageDocsLink,
	HealthyDot,
	Logs,
	Main,
	SectionLabel,
	StatusIcon,
} from "./Content";
import { DismissWarningButton } from "./DismissWarningButton";
import { healthyColor } from "./healthyColor";

type BooleanKeys<T> = {
	[K in keyof T]: T[K] extends boolean | null ? K : never;
}[keyof T];

interface FlagInfo {
	label: string;
	description: string;
	invert?: boolean;
}

const flagDescriptions: Record<BooleanKeys<NetcheckReport>, FlagInfo> = {
	UDP: {
		label: "UDP",
		description: "UDP STUN 往返是否成功完成。",
	},
	IPv6: {
		label: "IPv6",
		description: "IPv6 STUN 往返是否成功完成。",
	},
	IPv4: {
		label: "IPv4",
		description: "IPv4 STUN 往返是否成功完成。",
	},
	IPv6CanSend: {
		label: "IPv6 发送",
		description: "此服务器是否可以发送 IPv6 数据包。",
	},
	IPv4CanSend: {
		label: "IPv4 发送",
		description: "此服务器是否可以发送 IPv4 数据包。",
	},
	OSHasIPv6: {
		label: "操作系统 IPv6 支持",
		description: "操作系统是否支持 IPv6。",
	},
	ICMPv4: {
		label: "ICMP Ping",
		description: "ICMPv4 往返是否成功完成。",
	},
	MappingVariesByDestIP: {
		label: "无对称 NAT",
		description:
			"STUN 结果在不同目标之间是否一致。对称 NAT 可能会降低对等连接的连通性。",
		invert: true,
	},
	HairPinning: {
		label: "NAT 回流",
		description:
			"路由器是否支持通过公共 IP 地址在本地设备之间进行通信。",
	},
	UPnP: {
		label: "UPnP",
		description: "在局域网中是否检测到通用即插即用 (UPnP)。",
	},
	PMP: {
		label: "NAT-PMP",
		description: "在局域网中是否检测到 NAT 端口映射协议 (NAT-PMP)。",
	},
	PCP: {
		label: "PCP",
		description: "在局域网中是否检测到端口控制协议 (PCP)。",
	},
	CaptivePortal: {
		label: "无强制门户",
		description:
			"HTTP 流量是否不受强制门户拦截。",
		invert: true,
	},
};

interface FlagGroup {
	title: string;
	flags: BooleanKeys<NetcheckReport>[];
}

const flagGroups: FlagGroup[] = [
	{
		title: "连接性",
		flags: ["UDP", "IPv4", "IPv6", "ICMPv4", "CaptivePortal"],
	},
	{
		title: "IPv6 支持",
		flags: ["OSHasIPv6", "IPv4CanSend", "IPv6CanSend"],
	},
	{
		title: "NAT 穿透",
		flags: ["MappingVariesByDestIP", "HairPinning"],
	},
	{
		title: "端口映射",
		flags: ["UPnP", "PMP", "PCP"],
	},
];

const DERPPage: FC = () => {
	const { derp } = useOutletContext<HealthcheckReport>();
	const { netcheck, regions, netcheck_logs: logs } = derp;
	const safeNetcheck = netcheck || ({} as NetcheckReport);
	const theme = useTheme();

	return (
		<>
			<title>{pageTitle("DERP - 健康")}</title>

			<Header>
				<HeaderTitle>
					<HealthyDot severity={derp.severity as HealthSeverity} />
					DERP
				</HeaderTitle>
				<DismissWarningButton healthcheck="DERP" />
			</Header>

			<Main>
				{derp.warnings.map((warning) => {
					return (
						<Alert
							actions={<HealthMessageDocsLink {...warning} />}
							key={warning.code}
							severity="warning"
							prominent
						>
							{warning.message}
						</Alert>
					);
				})}

				<section>
					<SectionLabel>网络检查</SectionLabel>
					{flagGroups.map((group) => (
						<div key={group.title} className="mb-6">
							<h5 className="text-xs uppercase tracking-wide text-content-secondary m-0 mb-2">
								{group.title}
							</h5>
							<Table>
								<TableBody>
									{group.flags.map((flag) => (
										<TableRow key={flag}>
											<TableCell className="w-8">
												<StatusIcon
													value={
														safeNetcheck[flag] === null
															? null
															: flagDescriptions[flag].invert
																? !safeNetcheck[flag]
																: safeNetcheck[flag]
													}
												/>
											</TableCell>
											<TableCell className="font-medium whitespace-nowrap w-36">
												{flagDescriptions[flag].label}
											</TableCell>
											<TableCell className="text-content-secondary">
												{flagDescriptions[flag].description}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					))}
				</section>

				<section>
					<SectionLabel>区域</SectionLabel>
					<div className="flex flex-wrap gap-3">
						{Object.values(regions ?? {})
							.filter((region) => {
								// Values can technically be null
								return region !== null;
							})
							.sort((a, b) => {
								if (a.region && b.region) {
									return a.region.RegionName.localeCompare(b.region.RegionName);
								}
								return 0;
							})
							.map(({ severity, region }) => {
								if (!region) {
									return null;
								}
								return (
									<Button variant="outline" key={region.RegionID} asChild>
										<Link to={`/health/derp/regions/${region.RegionID}`}>
											<MapPinIcon
												style={{
													color: healthyColor(
														theme,
														severity as HealthSeverity,
													),
												}}
											/>
											{region.RegionName}
										</Link>
									</Button>
								);
							})}
					</div>
				</section>
				<section>
					<SectionLabel>日志</SectionLabel>
					<Logs
						lines={logs}
						className="rounded-lg border border-solid border-border text-content-secondary"
					/>
				</section>
			</Main>
		</>
	);
};

export default DERPPage;
