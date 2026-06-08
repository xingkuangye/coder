import { ExternalLinkIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import type React from "react";
import { Link } from "react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { ToolCollapsible } from "./ToolCollapsible";
import { ToolIcon } from "./ToolIcon";
import { asRecord, asString, type ToolStatus } from "./utils";
import { WorkspaceBuildLogSection } from "./WorkspaceBuildLogSection";

/**
 * 用于 `create_workspace` 工具调用的渲染。
 *
 * 运行中显示“正在创建工作区…”并带流式构建日志，
 * 完成后显示“已创建 <名称>”并提供查看工作区的链接。
 * 构建日志可在可折叠区域中查看。
 */
export const CreateWorkspaceTool: React.FC<{
	workspaceName: string;
	resultJson: string;
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
	buildId?: string;
	created?: boolean;
	labelOverride?: string;
}> = ({
	workspaceName,
	resultJson,
	status,
	isError,
	errorMessage,
	buildId,
	created = true,
	labelOverride,
}) => {
	const isRunning = status === "running";
	let rec: Record<string, unknown> | null = null;
	if (resultJson) {
		try {
			const parsed = JSON.parse(resultJson);
			rec = asRecord(parsed);
		} catch {
			// resultJson might already be an object or invalid JSON
			rec = asRecord(resultJson);
		}
	}
	const ownerName = rec ? asString(rec.owner_name) : "";
	const wsName = rec ? asString(rec.workspace_name) : workspaceName;
	const workspaceLink = ownerName && wsName ? `/@${ownerName}/${wsName}` : null;

	const label = isRunning
		? "正在创建工作区…"
		: labelOverride
			? labelOverride
			: isError
				? `创建 ${wsName || "工作区"} 失败`
				: created === false
					? `工作区 ${wsName} 已存在`
					: wsName
						? `已创建 ${wsName}`
						: "已创建工作区";

	const hasBuildLogs = isRunning || Boolean(buildId);

	const header = (
		<>
			<ToolIcon
				name="create_workspace"
				isError={isError}
				isRunning={isRunning}
			/>
			<span className="text-[13px] leading-6">{label}</span>
			{workspaceLink && !isRunning && (
				<Link
					to={workspaceLink}
					onClick={(e) => e.stopPropagation()}
					className="ml-1 inline-flex align-middle text-content-secondary opacity-50 transition-opacity hover:opacity-100"
					aria-label="查看工作区"
				>
					<ExternalLinkIcon className="size-3" />
				</Link>
			)}
		</>
	);
	const headerStatus = (
		<>
			{isError && (
				<Tooltip>
					<TooltipTrigger asChild>
						<TriangleAlertIcon className="size-3.5 shrink-0 text-current" />
					</TooltipTrigger>
					<TooltipContent>
						{errorMessage || "创建工作区失败"}
					</TooltipContent>
				</Tooltip>
			)}
			{isRunning && (
				<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
			)}
		</>
	);

	return (
		<div className="w-full">
			<ToolCollapsible
				header={header}
				headerStatus={headerStatus}
				hasContent={hasBuildLogs}
				defaultExpanded={isRunning}
			>
				<WorkspaceBuildLogSection status={status} buildId={buildId} />
			</ToolCollapsible>
		</div>
	);
};
