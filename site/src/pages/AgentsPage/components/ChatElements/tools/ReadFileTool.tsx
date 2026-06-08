import { useTheme } from "@emotion/react";
import { File as FileViewer } from "@pierre/diffs/react";
import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import type React from "react";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { asRecord, asString } from "../runtimeTypeUtils";
import { ToolCollapsible } from "./ToolCollapsible";
import { ToolIcon } from "./ToolIcon";
import {
	DIFFS_FONT_STYLE,
	getFileViewerOptionsMinimal,
	parseArgs,
	type ToolStatus,
} from "./utils";

const ReadFileContent: React.FC<{
	path: string;
	content: string;
}> = ({ path, content }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	return (
		<ScrollArea
			className="mt-1.5 rounded-md border border-solid border-border-default text-2xs"
			viewportClassName="max-h-64"
			scrollBarClassName="w-1.5"
		>
			<FileViewer
				file={{
					name: path,
					contents: content,
				}}
				options={getFileViewerOptionsMinimal(isDark)}
				style={DIFFS_FONT_STYLE}
			/>
		</ScrollArea>
	);
};

export const getReadFileToolData = ({
	args,
	result,
	isError,
}: {
	args?: unknown;
	result?: unknown;
	isError: boolean;
}) => {
	const parsedArgs = parseArgs(args);
	const path = parsedArgs ? asString(parsedArgs.path).trim() : "";
	const rec = asRecord(result);
	return {
		path: path || "文件",
		content: rec ? asString(rec.content).trim() : "",
		isError,
		errorMessage: rec ? asString(rec.error || rec.message) : undefined,
	};
};

/**
 * 默认折叠的 `read_file` 工具调用渲染。显示“已读取 <filename>”和展开箭头；展开后显示文件查看器。
 */
export const ReadFileTool: React.FC<{
	path: string;
	content: string;
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
	expanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
}> = ({
	path,
	content,
	status,
	isError,
	errorMessage,
	expanded,
	onExpandedChange,
}) => {
	const hasContent = content.length > 0 || isError;
	const isRunning = status === "running";
	const filename = path.split("/").pop() || path;
	const label = isRunning ? `正在读取 ${filename}…` : `已读取 ${filename}`;

	return (
		<ToolCollapsible
			className="w-full"
			hasContent={hasContent}
			expanded={expanded}
			onExpandedChange={onExpandedChange}
			header={
				<>
					<ToolIcon name="read_file" isError={isError} isRunning={isRunning} />
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
								{errorMessage || "读取文件失败"}
							</TooltipContent>
						</Tooltip>
					)}
					{isRunning && (
						<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
					)}
				</>
			}
		>
			{isError && (
				<div className="mt-1 text-xs text-content-destructive">
					{errorMessage || "读取文件失败"}
				</div>
			)}
			{content.length > 0 && <ReadFileContent path={path} content={content} />}
		</ToolCollapsible>
	);
};
