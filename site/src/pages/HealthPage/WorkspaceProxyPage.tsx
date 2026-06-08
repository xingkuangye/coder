import { GlobeIcon, HashIcon } from "lucide-react";
import type { FC } from "react";
import { useOutletContext } from "react-router";
import type { HealthcheckReport } from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { ExternalImage } from "#/components/ExternalImage/ExternalImage";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { cn } from "#/utils/cn";
import { createDayString } from "#/utils/createDayString";
import { pageTitle } from "#/utils/page";
import {
	BooleanPill,
	Header,
	HeaderTitle,
	HealthMessageDocsLink,
	HealthyDot,
	Main,
	Pill,
} from "./Content";
import { DismissWarningButton } from "./DismissWarningButton";

const WorkspaceProxyPage: FC = () => {
	const healthStatus = useOutletContext<HealthcheckReport>();
	const { workspace_proxy } = healthStatus;
	const { regions } = workspace_proxy.workspace_proxies;

	return (
		<>
			<title>{pageTitle("工作区代理 - 健康")}</title>

			<Header>
				<HeaderTitle>
					<HealthyDot severity={workspace_proxy.severity} />
					工作区代理
				</HeaderTitle>
				<DismissWarningButton healthcheck="WorkspaceProxy" />
			</Header>

			<Main>
				{workspace_proxy.error && (
					<Alert severity="error" prominent>
						{workspace_proxy.error}
					</Alert>
				)}
				{workspace_proxy.warnings.map((warning) => {
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

				{regions.map((region) => {
					const errors = region.status?.report?.errors ?? [];
					const warnings = region.status?.report?.warnings ?? [];

					return (
						<div
							key={region.id}
							className={cn(
								"rounded-lg border border-solid text-sm",
								region.healthy ? "border-border" : "border-border-warning",
							)}
						>
							<header className="p-6 flex items-center justify-between gap-6">
								<div className="flex items-center gap-6">
									<div className="w-9 h-9 flex items-center justify-center">
										<ExternalImage
											src={region.icon_url}
											className="object-fill w-full h-full"
											alt=""
										/>
									</div>
									<div className="leading-relaxed">
										<h4 className="font-medium m-0">{region.display_name}</h4>
										<span className="text-content-secondary">
											{region.version}
										</span>
									</div>
								</div>

								<div className="flex flex-wrap gap-3">
									{region.wildcard_hostname && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Pill icon={<GlobeIcon />}>
													{region.wildcard_hostname}
												</Pill>
											</TooltipTrigger>
											<TooltipContent side="bottom">
												通配符主机名
											</TooltipContent>
										</Tooltip>
									)}
									{region.version && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Pill icon={<HashIcon className="size-icon-sm" />}>
													{region.version}
												</Pill>
											</TooltipTrigger>
											<TooltipContent side="bottom">版本</TooltipContent>
										</Tooltip>
									)}
									{region.derp_enabled && (
										<BooleanPill value={region.derp_enabled}>
											DERP 已启用
										</BooleanPill>
									)}
									{region.derp_only && (
										<BooleanPill value={region.derp_only}>
											仅 DERP
										</BooleanPill>
									)}
									{region.deleted && (
										<BooleanPill value={region.deleted}>已删除</BooleanPill>
									)}
								</div>
							</header>

							<div className="border-0 border-t border-solid border-border flex items-center justify-between py-3 px-6 text-xs text-content-secondary">
								{region.status?.status === "unregistered" ? (
									<span>尚未连接</span>
								) : warnings.length === 0 && errors.length === 0 ? (
									<span>正常</span>
								) : (
									<div className="flex flex-col">
										{[...errors, ...warnings].map((msg) => (
											<span key={msg} className="[&::first-letter]:uppercase">
												{msg}
											</span>
										))}
									</div>
								)}
								<span data-chromatic="ignore">
									{createDayString(region.updated_at)}
								</span>
							</div>
						</div>
					);
				})}
			</Main>
		</>
	);
};

export default WorkspaceProxyPage;
