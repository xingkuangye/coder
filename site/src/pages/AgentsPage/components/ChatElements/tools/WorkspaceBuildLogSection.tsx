import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { workspaceBuildLogs } from "#/api/queries/workspaceBuilds";
import { workspaceById } from "#/api/queries/workspaces";
import type { ProvisionerJobLog } from "#/api/typesGenerated";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import { useWorkspaceBuildLogs } from "#/hooks/useWorkspaceBuildLogs";
import { WorkspaceBuildLogs } from "#/modules/workspaces/WorkspaceBuildLogs/WorkspaceBuildLogs";
import {
	useChatBuildId,
	useChatWorkspaceId,
} from "../../../context/ChatWorkspaceContext";
import type { ToolStatus } from "./utils";

interface WorkspaceBuildLogSectionProps {
	status: ToolStatus;
	/** Build ID from the completed tool result. */
	buildId?: string;
}

// How long to wait for the first log entry before showing a
// warning. Builds can stay queued or run slow Terraform init for
// longer than this. The message is intentionally soft.
const LOG_LOAD_TIMEOUT_MS = 30_000;

/**
 * 流式传输或获取工作区构建日志，以便在工具折叠面板中显示。工具运行时，
 * 日志通过 WebSocket 流式传输，来自聊天绑定跟踪的构建（或回退到工作区
 * 的最新活跃构建）。完成后，日志通过 REST 获取并由 React Query 缓存，
 * 因此展开/折叠不会重新获取。
 */
export const WorkspaceBuildLogSection: FC<WorkspaceBuildLogSectionProps> = ({
	status,
	buildId,
}) => {
	const isRunning = status === "running";

	// Primary source: build ID from the chat binding, pushed via
	// pubsub when create_workspace or start_workspace persists it.
	// This avoids the 2s polling latency.
	const chatBuildId = useChatBuildId();

	// Fallback: poll the workspace to infer the build ID from
	// latest_build. Only used when the binding hasn't arrived yet.
	const workspaceId = useChatWorkspaceId();
	const needsPoll = isRunning && !chatBuildId;
	const workspaceQuery = useQuery({
		...workspaceById(workspaceId ?? ""),
		enabled: needsPoll && Boolean(workspaceId),
		refetchInterval: needsPoll ? 2000 : false,
	});
	const liveBuildId = workspaceQuery.data?.latest_build?.id;

	// Only use the polled build if it's actually in progress.
	const latestBuildStatus = workspaceQuery.data?.latest_build?.status;
	const polledActiveBuildId =
		latestBuildStatus === "pending" || latestBuildStatus === "starting"
			? liveBuildId
			: undefined;

	// While running: prefer chat binding (instant via pubsub),
	// fall back to polled workspace (2s latency). When completed:
	// use the build ID from the tool result.
	const effectiveBuildId = isRunning
		? (chatBuildId ?? polledActiveBuildId)
		: buildId;

	// --- Running builds: stream via WebSocket ---
	const streamingLogs = useWorkspaceBuildLogs(
		isRunning ? effectiveBuildId : undefined,
		isRunning && Boolean(effectiveBuildId),
	);

	// --- Completed builds: fetch via REST (cached across mounts) ---
	const completedLogsQuery = useQuery({
		...workspaceBuildLogs(effectiveBuildId ?? ""),
		enabled: !isRunning && Boolean(effectiveBuildId),
	});

	const logs: ProvisionerJobLog[] | undefined = isRunning
		? streamingLogs
		: // Fall back to accumulated streaming logs while the REST
			// fetch is in-flight, avoiding a flash of "Loading…" on
			// the running→completed transition.
			(completedLogsQuery.data ?? streamingLogs);

	// --- Timeout: detect if logs never arrive ---
	// Derive a stable boolean so the effect only re-runs when logs
	// first appear or when the build ID changes, not on every
	// appended log entry.
	const hasLogs = Boolean(logs && logs.length > 0);
	const [timedOut, setTimedOut] = useState(false);
	useEffect(() => {
		setTimedOut(false);
		if (!effectiveBuildId || hasLogs) {
			return;
		}
		const timer = setTimeout(() => setTimedOut(true), LOG_LOAD_TIMEOUT_MS);
		return () => clearTimeout(timer);
	}, [effectiveBuildId, hasLogs]);

	const fetchFailed = !isRunning && completedLogsQuery.isError;

	if (!effectiveBuildId) {
		if (isRunning && workspaceId) {
			return (
				<div className="flex items-center gap-2 py-3 px-4 text-xs text-content-secondary">
					<LoaderIcon className="size-3 animate-spin motion-reduce:animate-none" />
					<span>正在加载构建日志…</span>
				</div>
			);
		}
		return null;
	}

	if (fetchFailed) {
		return (
			<div className="flex items-center gap-2 py-3 px-4 text-xs text-content-secondary">
				<TriangleAlertIcon className="size-3" />
				<span>加载构建日志失败。</span>
			</div>
		);
	}

	if (timedOut && !hasLogs) {
		return (
			<div className="flex items-center gap-2 py-3 px-4 text-xs text-content-secondary">
				<TriangleAlertIcon className="size-3" />
				<span>构建日志加载时间比预期更长。</span>
			</div>
		);
	}

	// Query succeeded but the build produced no log output.
	if (
		!isRunning &&
		completedLogsQuery.isSuccess &&
		(!logs || logs.length === 0)
	) {
		return (
			<div className="flex items-center gap-2 py-3 px-4 text-xs text-content-secondary">
				<span>没有可用的构建日志。</span>
			</div>
		);
	}

	if (!logs || logs.length === 0) {
		return (
			<div className="flex items-center gap-2 py-3 px-4 text-xs text-content-secondary">
				<LoaderIcon className="size-3 animate-spin motion-reduce:animate-none" />
				<span>正在加载构建日志…</span>
			</div>
		);
	}

	return (
		<ScrollArea
			className="mt-1.5 rounded-md border border-solid border-border-default text-2xs"
			viewportClassName="max-h-64"
			scrollBarClassName="w-1.5"
		>
			<WorkspaceBuildLogs
				logs={logs}
				sticky
				className="border-0 rounded-none"
			/>
		</ScrollArea>
	);
};
