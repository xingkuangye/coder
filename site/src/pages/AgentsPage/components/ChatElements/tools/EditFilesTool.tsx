import { useTheme } from "@emotion/react";
import type { FileDiffMetadata } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import type React from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import {
	type AgentDisplayState,
	isAgentDisplayFullyExpanded,
	resolveAgentDisplayState,
} from "./displayMode";
import { AgentDisplayModeToolCollapsible } from "./ToolCollapsible";
import { ToolIcon } from "./ToolIcon";
import {
	DIFFS_FONT_STYLE,
	type EditFilesFileEntry,
	getDiffViewerOptions,
	stripNoNewline,
	type ToolStatus,
} from "./utils";

const EDIT_FILES_AUTO_DISPLAY_STATE: AgentDisplayState = "preview";

export const EditFilesTool: React.FC<{
	files: EditFilesFileEntry[];
	diffs: (FileDiffMetadata | null)[];
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
	codeDiffDisplayMode?: TypesGen.AgentDisplayMode;
}> = ({ files, diffs, status, isError, errorMessage, codeDiffDisplayMode }) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";
	const isRunning = status === "running";
	const hasDiffs = diffs.some((d) => d !== null);
	const displayState = resolveAgentDisplayState(
		codeDiffDisplayMode,
		EDIT_FILES_AUTO_DISPLAY_STATE,
	);

	let label: string;
	if (isRunning) {
		if (files.length === 1) {
			label = `正在编辑 ${files[0].path.split("/").pop() || files[0].path}…`;
		} else if (files.length > 1) {
			label = `正在编辑 ${files.length} 个文件…`;
		} else {
			label = "正在编辑文件…";
		}
	} else if (files.length === 1) {
		const filename = files[0].path.split("/").pop() || files[0].path;
		label = `已编辑 ${filename}`;
	} else if (files.length > 1) {
		label = `已编辑 ${files.length} 个文件`;
	} else {
		label = "已编辑文件";
	}

	return (
		<AgentDisplayModeToolCollapsible
			className="w-full"
			hasContent={hasDiffs}
			displayMode={codeDiffDisplayMode}
			autoDisplayState={EDIT_FILES_AUTO_DISPLAY_STATE}
			header={
				<>
					<ToolIcon name="edit_files" isError={isError} isRunning={isRunning} />
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
								{errorMessage || "编辑文件失败"}
							</TooltipContent>
						</Tooltip>
					)}
					{isRunning && (
						<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
					)}
				</>
			}
		>
			<div className="mt-1.5 space-y-1.5">
				{diffs.map((diff, i) =>
					diff ? (
						<ScrollArea
							key={files[i].path}
							data-testid="edit-file-diff"
							className="rounded-md border border-solid border-border-default text-2xs"
							viewportClassName={
								isAgentDisplayFullyExpanded(displayState)
									? "max-h-[80vh]"
									: "max-h-64"
							}
							scrollBarClassName="w-1.5"
						>
							<FileDiff
								fileDiff={stripNoNewline(diff)}
								options={getDiffViewerOptions(isDark)}
								style={DIFFS_FONT_STYLE}
							/>
						</ScrollArea>
					) : null,
				)}
			</div>
		</AgentDisplayModeToolCollapsible>
	);
};
