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

/**
 * 为 `list_templates` 工具提供默认折叠的渲染。显示“已列出 N 个模板”，并带有一个展开图标；展开后会显示模板列表。
 */
export const ListTemplatesTool: React.FC<{
	templates: unknown[];
	count: number;
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
}> = ({ templates, count, status, isError, errorMessage }) => {
	const hasContent = templates.length > 0;
	const isRunning = status === "running";

	const label =
		isRunning || count === 0
			? "正在列出模板…"
			: count === 1
				? "已列出 1 个模板"
				: `已列出 ${count} 个模板`;

	return (
		<ToolCollapsible
			className="w-full"
			hasContent={hasContent}
			header={
				<>
					<ToolIcon
						name="list_templates"
						isError={isError}
						isRunning={isRunning}
					/>
					<span className="text-[13px] leading-6">{label}</span>
				</>
			}
			headerStatus={
				<>
					{isError && (
						<Tooltip>
							<TooltipTrigger asChild>
								<TriangleAlertIcon className="size-3.5 shrink-0 text-current" />
							</TooltipTrigger>
							<TooltipContent>
								{errorMessage || "列出模板失败"}
							</TooltipContent>
						</Tooltip>
					)}
					{isRunning && (
						<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
					)}
				</>
			}
		>
			<div className="mt-1.5">
				{templates.map((template, index) => {
					const rec = asRecord(template);
					if (!rec) {
						return null;
					}
					const name = asString(rec.name);
					const displayName = asString(rec.display_name);
					const templateName = displayName || name || `模板 ${index + 1}`;

					if (!name) {
						return (
							<div key={index} className="text-[13px] text-content-secondary">
								{templateName}
							</div>
						);
					}

					return (
						<div key={name} className="flex items-center gap-1.5">
							<Link
								to={`/templates/${name}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-[13px] text-content-secondary opacity-50 transition-opacity hover:opacity-100"
							>
								<span>{templateName}</span>
								<ExternalLinkIcon className="size-3 shrink-0" />
							</Link>
						</div>
					);
				})}
			</div>
		</ToolCollapsible>
	);
};
