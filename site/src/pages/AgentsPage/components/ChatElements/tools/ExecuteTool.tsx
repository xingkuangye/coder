import {
	CheckIcon,
	ChevronDownIcon,
	CircleAlertIcon,
	ExternalLinkIcon,
	LayersIcon,
	LoaderIcon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { CopyButton } from "#/components/CopyButton/CopyButton";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { cn } from "#/utils/cn";
import { TranscriptRow } from "../TranscriptRow";
import {
	type AgentDisplayState,
	isAgentDisplayOpen,
	resolveAgentDisplayState,
} from "./displayMode";
import { ToolIcon } from "./ToolIcon";
import type { ExecuteTranscriptBlock } from "./toolVisibility";
import {
	formatShellDurationMs,
	sanitizeExecuteModelIntent,
	signalTooltipLabel,
	summarizeParsedCommands,
	type ToolStatus,
} from "./utils";

type ExecuteToolProps = {
	command: string;
	transcriptBlocks: readonly ExecuteTranscriptBlock[];
	status: ToolStatus;
	isError: boolean;
	durationMs?: number;
	isBackgrounded?: boolean;
	killedBySignal?: "kill" | "terminate";
	modelIntent?: string;
	parsedCommands?: readonly string[][];
	shellToolDisplayMode?: TypesGen.AgentDisplayMode;
};

type ExecuteToolInnerProps = ExecuteToolProps & {
	outputInitiallyOpen: boolean;
};

export const ExecuteTool: React.FC<ExecuteToolProps> = (props) => {
	const hasTranscriptBlocks = props.transcriptBlocks.length > 0;
	const autoDisplayState: AgentDisplayState =
		hasTranscriptBlocks ||
		props.status === "running" ||
		props.isBackgrounded ||
		!!props.killedBySignal
			? "preview"
			: "collapsed";
	const resolvedDisplayState = resolveAgentDisplayState(
		props.shellToolDisplayMode,
		autoDisplayState,
	);
	return (
		<ExecuteToolInner
			key={`${props.shellToolDisplayMode ?? "auto"}:${autoDisplayState}`}
			{...props}
			outputInitiallyOpen={isAgentDisplayOpen(resolvedDisplayState)}
		/>
	);
};

const ExecuteToolInner: React.FC<ExecuteToolInnerProps> = ({
	command,
	transcriptBlocks,
	status,
	isError,
	durationMs,
	isBackgrounded = false,
	killedBySignal,
	modelIntent,
	parsedCommands,
	outputInitiallyOpen,
}) => {
	const hasCommand = command.trim().length > 0;
	const isRunning = status === "running";
	const showFailureIndicator = isError && !isRunning;
	const [outputOpen, setOutputOpen] = useState(outputInitiallyOpen);
	const outputToggleLabel = outputOpen ? "折叠命令" : "展开命令";
	const durationLabel = formatShellDurationMs(durationMs);

	if (!hasCommand) {
		return null;
	}

	return (
		<div className="group/exec grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 rounded-md bg-surface-primary font-sans font-normal text-xs leading-5">
			<TranscriptRow
				asChild
				className="col-start-1 row-start-1 m-0 w-full min-w-0 cursor-pointer gap-2 border-0 bg-transparent p-0 text-left font-[inherit] font-normal text-[inherit] text-content-secondary transition-colors hover:text-content-primary"
			>
				<button
					type="button"
					aria-expanded={outputOpen}
					aria-label={outputToggleLabel}
					onClick={() => setOutputOpen((value) => !value)}
				>
					<ShellCommandLine
						command={command}
						modelIntent={modelIntent}
						parsedCommands={parsedCommands}
						durationLabel={durationLabel}
						expanded={outputOpen}
					/>
				</button>
			</TranscriptRow>
			<TranscriptRow className="col-start-2 row-start-1 shrink-0 gap-1">
				{isRunning && (
					<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-content-secondary" />
				)}
				{showFailureIndicator && (
					<Tooltip>
						<TooltipTrigger asChild>
							<span
								aria-label="命令失败"
								role="img"
								className="flex shrink-0 text-content-secondary"
							>
								<TriangleAlertIcon aria-hidden className="size-3.5 shrink-0" />
							</span>
						</TooltipTrigger>
						<TooltipContent>命令失败</TooltipContent>
					</Tooltip>
				)}
				{isBackgrounded && !isRunning && (
					<Tooltip>
						<TooltipTrigger asChild>
							<span
								aria-label="正在后台运行"
								role="img"
								className="flex shrink-0 text-content-secondary"
							>
								<LayersIcon aria-hidden className="size-3.5 shrink-0" />
							</span>
						</TooltipTrigger>
						<TooltipContent>正在后台运行</TooltipContent>
					</Tooltip>
				)}
				{killedBySignal && !isRunning && (
					<Tooltip>
						<TooltipTrigger asChild>
							<OctagonXIcon className="size-3.5 shrink-0 text-content-secondary" />
						</TooltipTrigger>
						<TooltipContent>
							{signalTooltipLabel(killedBySignal)}
						</TooltipContent>
					</Tooltip>
				)}
				<CopyButton
					text={command}
					label="复制命令"
					className="-my-0.5 size-6 p-0 opacity-0 transition-opacity hover:bg-surface-tertiary group-hover/exec:opacity-100"
				/>
			</TranscriptRow>
			{outputOpen && (
				<ShellTranscriptBody
					command={command}
					transcriptBlocks={transcriptBlocks}
					isError={isError}
				/>
			)}
		</div>
	);
};

const ShellCommandLine: React.FC<{
	command: string;
	modelIntent?: string;
	parsedCommands?: readonly string[][];
	durationLabel: string;
	expanded?: boolean;
}> = ({ command, modelIntent, parsedCommands, durationLabel, expanded }) => {
	const intentLabel = sanitizeExecuteModelIntent(modelIntent, command);
	const summary =
		parsedCommands && parsedCommands.length > 0
			? summarizeParsedCommands(parsedCommands)
			: "";
	const commandDisplay = summary || command;
	const commandLabel = intentLabel
		? `${intentLabel} 使用 ${commandDisplay}`
		: `执行了 ${commandDisplay}`;
	const durationSuffix = durationLabel ? `，耗时 ${durationLabel}` : "";

	return (
		<>
			<ToolIcon name="execute" isError={false} />
			<span className="min-w-0 truncate text-[13px] font-normal leading-6 text-current">
				{commandLabel}
				{durationSuffix && (
					<span className="text-content-secondary">{durationSuffix}</span>
				)}
			</span>
			{expanded !== undefined && (
				<ChevronDownIcon
					className={cn(
						"size-3 shrink-0 text-current transition-transform",
						expanded ? "rotate-0" : "-rotate-90",
					)}
				/>
			)}
		</>
	);
};

const ShellTranscriptBody: React.FC<{
	command: string;
	transcriptBlocks: readonly ExecuteTranscriptBlock[];
	isError: boolean;
}> = ({ command, transcriptBlocks, isError }) => {
	return (
		<ScrollArea
			className="col-start-1 col-span-2 mt-2 rounded-xl bg-surface-secondary/60 text-2xs"
			viewportClassName="max-h-64"
			scrollBarClassName="w-1.5"
		>
			<div className="px-3 py-2.5">
				<pre className="m-0 whitespace-pre-wrap break-words border-0 bg-transparent p-0 font-mono text-xs font-semibold leading-5 text-content-primary">
					<span aria-hidden className="select-none">
						$
					</span>{" "}
					{command}
				</pre>
				{transcriptBlocks.map((block) => (
					<pre
						key={block.kind}
						className={cn(
							"m-0 mt-4 whitespace-pre-wrap break-words border-0 bg-transparent p-0 font-mono text-xs font-normal leading-5",
							block.kind === "error" || isError
								? "text-content-destructive"
								: "text-content-secondary",
						)}
					>
						{block.text}
					</pre>
				))}
			</div>
		</ScrollArea>
	);
};

export const ExecuteAuthRequiredTool: React.FC<{
	command: string;
	output: string;
	authenticateURL: string;
	providerLabel: string;
}> = ({ command, output, authenticateURL, providerLabel }) => {
	const hasCommand = command.trim().length > 0;
	const hasOutput = output.trim().length > 0;

	return (
		<div className="w-full overflow-hidden rounded-md border border-solid border-border-default bg-surface-primary">
			<div className="flex flex-wrap items-center gap-2 px-3 py-2">
				<CircleAlertIcon className="size-4 shrink-0 text-content-warning" />
				<span className="text-[13px] text-content-primary">
					在 {providerLabel} 认证以继续执行此命令。
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-2 px-3 pb-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						window.open(authenticateURL, "_blank", "width=900,height=600")
					}
					className="inline-flex cursor-pointer items-center gap-1 text-xs"
				>
					<ExternalLinkIcon className="size-3.5 shrink-0" />
					在 {providerLabel} 认证
				</Button>
				<a
					href={authenticateURL}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-xs text-content-link no-underline hover:underline"
				>
					<ExternalLinkIcon className="size-3.5 shrink-0" />
					打开认证链接
				</a>
			</div>
			{hasCommand && (
				<div className="px-3 pb-1">
					<code className="font-mono text-xs text-content-secondary">
						$ {command}
					</code>
				</div>
			)}
			{hasOutput && (
				<ScrollArea
					className="rounded-b-md border-t border-solid border-border-default text-2xs"
					viewportClassName="max-h-48"
					scrollBarClassName="w-1.5"
				>
					<pre className="m-0 whitespace-pre-wrap break-all border-0 bg-transparent px-3 py-2 font-mono text-xs text-content-secondary">
						{output}
					</pre>
				</ScrollArea>
			)}
		</div>
	);
};

export const WaitForExternalAuthTool: React.FC<{
	providerLabel: string;
	status: ToolStatus;
	authenticated: boolean;
	timedOut: boolean;
	isError: boolean;
	errorMessage?: string;
}> = ({
	providerLabel,
	status,
	authenticated,
	timedOut,
	isError,
	errorMessage,
}) => {
	const isRunning = status === "running";
	let label = `正在等待 ${providerLabel} 认证...`;
	let icon: React.ReactNode = (
		<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-content-link" />
	);
	if (isError) {
		label =
			errorMessage ||
			`等待 ${providerLabel} 认证时失败`;
		icon = (
			<TriangleAlertIcon className="size-3.5 shrink-0 text-content-secondary" />
		);
	} else if (timedOut) {
		label = `等待 ${providerLabel} 认证超时`;
		icon = (
			<CircleAlertIcon className="size-3.5 shrink-0 text-content-warning" />
		);
	} else if (authenticated && !isRunning) {
		label = `已通过 ${providerLabel} 认证`;
		icon = <CheckIcon className="size-3.5 shrink-0 text-content-success" />;
	}

	return (
		<div className="w-full overflow-hidden rounded-md border border-solid border-border-default bg-surface-primary px-3 py-2">
			<div className="flex items-center gap-2">
				{icon}
				<span className="text-[13px] text-content-primary">{label}</span>
			</div>
		</div>
	);
};
