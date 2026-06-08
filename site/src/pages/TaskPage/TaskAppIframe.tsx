import {
	EllipsisVerticalIcon,
	ExternalLinkIcon,
	HouseIcon,
} from "lucide-react";
import { type FC, type HTMLProps, useRef } from "react";
import { Link as RouterLink } from "react-router";
import type { Workspace } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { Spinner } from "#/components/Spinner/Spinner";
import { useProxy } from "#/contexts/ProxyContext";
import { useAppLink } from "#/modules/apps/useAppLink";
import type { WorkspaceAppWithAgent } from "#/modules/tasks/apps";
import { cn } from "#/utils/cn";
import { TaskWildcardWarning } from "./TaskWildcardWarning";

type TaskAppIFrameProps = {
	workspace: Workspace;
	app: WorkspaceAppWithAgent;
	active: boolean;
};

export const TaskAppIFrame: FC<TaskAppIFrameProps> = ({
	workspace,
	app,
	active,
}) => {
	const link = useAppLink(app, {
		agent: app.agent,
		workspace,
	});
	const proxy = useProxy();
	const frameRef = useRef<HTMLIFrameElement>(null);
	const shouldDisplayWildcardWarning =
		app.subdomain && !proxy.proxy?.preferredWildcardHostname;

	if (shouldDisplayWildcardWarning) {
		return (
			<div className="h-full flex items-center justify-center pb-4">
				<TaskWildcardWarning />
			</div>
		);
	}

	return (
		<div className={cn([active ? "flex" : "hidden", "w-full h-full flex-col"])}>
			{app.slug === "preview" && (
				<div className="bg-surface-tertiary flex items-center p-2 py-1 gap-1">
					<Button
						size="icon"
						variant="subtle"
						onClick={(e) => {
							e.preventDefault();
							if (frameRef.current?.contentWindow) {
								frameRef.current.contentWindow.location.href = link.href;
							}
						}}
					>
						<HouseIcon />
						<span className="sr-only">主页</span>
					</Button>

					{/* Possibly we will put a URL bar here, but for now we cannot due to
					 * cross-origin restrictions in iframes. */}
					<div className="w-full"></div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="subtle" aria-label="更多选项">
								<EllipsisVerticalIcon aria-hidden="true" />
								<span className="sr-only">更多选项</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<RouterLink to={link.href} target="_blank">
									<ExternalLinkIcon />
									在新标签页中打开应用
								</RouterLink>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}

			{app.health === "healthy" || app.health === "disabled" ? (
				<TaskIframe ref={frameRef} src={link.href} title={link.label} />
			) : app.health === "unhealthy" ? (
				<div className="w-full h-full flex flex-col items-center justify-center p-4">
					<h3 className="m-0 font-medium text-content-primary text-base text-center">
						应用 "{app.display_name}" 运行状况不佳
					</h3>
					<div className="text-content-secondary text-sm">
						<span className="block text-center">
							您可以尝试以下故障排除步骤：
						</span>
						<ul className="m-0 pt-4 flex flex-col gap-4">
							{app.healthcheck && (
								<li>
									<span className="block font-medium text-content-primary mb-1">
										验证健康检查
									</span>
									尝试在工作区中运行以下命令：{" "}
									<code className="font-mono text-content-primary select-all">
										curl -v "{app.healthcheck.url}"
									</code>
								</li>
							)}
							<li>
								<span className="block font-medium text-content-primary mb-1">
									检查日志
								</span>
								在工作区 "{workspace.name}" 中查看{" "}
								<code className="font-mono text-content-primary select-all">
									/tmp/coder-agent.log
								</code>{" "}
								以获取更多信息。
							</li>
						</ul>
					</div>
				</div>
			) : app.health === "initializing" ? (
				<div className="w-full h-full flex items-center justify-center">
					<Spinner loading />
				</div>
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center">
					<h3 className="m-0 font-medium text-content-primary text-base">
						错误
					</h3>
					<span className="text-content-secondary text-sm">
						应用处于未知的健康状态。
					</span>
				</div>
			)}
		</div>
	);
};

type TaskIframeProps = HTMLProps<HTMLIFrameElement>;

export const TaskIframe: FC<TaskIframeProps> = ({ className, ...props }) => {
	return (
		<iframe
			loading="eager"
			className={cn("w-full h-full border-0", className)}
			allow="clipboard-read; clipboard-write"
			{...props}
		/>
	);
};
