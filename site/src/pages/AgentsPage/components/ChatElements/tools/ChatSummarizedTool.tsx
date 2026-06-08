import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import type React from "react";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { Response } from "../Response";
import { ToolCollapsible } from "./ToolCollapsible";
import { ToolIcon } from "./ToolIcon";
import type { ToolStatus } from "./utils";

/**
 * 默认折叠渲染 `chat_summarized` 工具调用。
 * 显示“已总结”，并在展开时显示摘要。
 */
export const ChatSummarizedTool: React.FC<{
	summary: string;
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
}> = ({ summary, status, isError, errorMessage }) => {
	const hasSummary = summary.trim().length > 0;
	const isRunning = status === "running";

	return (
		<ToolCollapsible
			className="w-full"
			hasContent={hasSummary}
			header={
				<>
					<ToolIcon
						name="chat_summarized"
						isError={isError}
						isRunning={isRunning}
					/>
					<span className="text-[13px] leading-6">
						{isRunning ? "正在总结…" : "已总结"}
					</span>
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
								{errorMessage || "对话总结失败"}
							</TooltipContent>
						</Tooltip>
					)}
					{isRunning && (
						<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
					)}
				</>
			}
		>
			<ScrollArea
				className="mt-1.5 rounded-md border border-solid border-border-default"
				viewportClassName="max-h-64"
				scrollBarClassName="w-1.5"
			>
				<div className="px-3 py-2">
					<Response>{summary}</Response>
				</div>
			</ScrollArea>
		</ToolCollapsible>
	);
};
