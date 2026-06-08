import isChromatic from "chromatic/isChromatic";
import {
	ArrowLeftIcon,
	PauseIcon,
	RotateCcwIcon,
	TriangleAlertIcon,
} from "lucide-react";
import {
	type FC,
	type PropsWithChildren,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Link as RouterLink, useParams } from "react-router";
import type { FixedSizeList } from "react-window";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail, getErrorMessage, isApiError } from "#/api/errors";
import { pauseTask, resumeTask, taskLogs } from "#/api/queries/tasks";
import { template as templateQueryOptions } from "#/api/queries/templates";
import {
	workspaceByOwnerAndName,
	workspaceByOwnerAndNameKey,
	workspacePermissions,
} from "#/api/queries/workspaces";
import type {
	Task,
	TaskLogEntry,
	Workspace,
	WorkspaceAgent,
	WorkspaceStatus,
} from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { InfoTooltip } from "#/components/InfoTooltip/InfoTooltip";
import { Loader } from "#/components/Loader/Loader";
import { Margins } from "#/components/Margins/Margins";
import { ScrollArea } from "#/components/ScrollArea/ScrollArea";
import { Spinner } from "#/components/Spinner/Spinner";
import { useWorkspaceBuildLogs } from "#/hooks/useWorkspaceBuildLogs";
import { AgentLogs } from "#/modules/resources/AgentLogs/AgentLogs";
import { useAgentLogs } from "#/modules/resources/useAgentLogs";
import { getAllAppsWithAgent } from "#/modules/tasks/apps";
import { TasksSidebar } from "#/modules/tasks/TasksSidebar/TasksSidebar";
import { isPauseDisabled } from "#/modules/tasks/taskActions";
import { WorkspaceErrorDialog } from "#/modules/workspaces/ErrorDialog/WorkspaceErrorDialog";
import { WorkspaceBuildLogs } from "#/modules/workspaces/WorkspaceBuildLogs/WorkspaceBuildLogs";
import { WorkspaceOutdatedTooltip } from "#/modules/workspaces/WorkspaceOutdatedTooltip/WorkspaceOutdatedTooltip";
import { cn } from "#/utils/cn";
import { pageTitle } from "#/utils/page";
import { relativeTime } from "#/utils/time";
import {
	getActiveTransitionStats,
	WorkspaceBuildProgress,
} from "../WorkspacePage/WorkspaceBuildProgress";
import { FollowUpDialog } from "./FollowUpDialog";
import { ModifyPromptDialog } from "./ModifyPromptDialog";
import { TaskAppIFrame } from "./TaskAppIframe";
import { TaskApps } from "./TaskApps";
import { TaskTopbar } from "./TaskTopbar";

type FollowUpStage =
	| "idle"
	| "resuming"
	| "waitingForActive"
	| "sending"
	| "error";

const TaskPageLayout: FC<PropsWithChildren> = ({ children }) => {
	return (
		<div className="flex items-stretch h-full">
			<TasksSidebar />
			<div className="flex flex-col h-full flex-1">{children}</div>
		</div>
	);
};

const TaskPage = () => {
	const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
	const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
	const [followUpDraft, setFollowUpDraft] = useState("");
	const [followUpStage, setFollowUpStage] = useState<FollowUpStage>("idle");
	const [followUpError, setFollowUpError] = useState<string>();
	const { taskId, username } = useParams() as {
		taskId: string;
		username: string;
	};
	const taskRouteKey = `${username}/${taskId}`;
	const prevTaskRouteKeyRef = useRef(taskRouteKey);
	const queryClient = useQueryClient();
	const resumeFollowUpMutation = useMutation({
		mutationFn: () => API.resumeTask(username, taskId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
	const sendFollowUpMutation = useMutation({
		mutationFn: (input: string) => API.sendTaskInput(username, taskId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
	const { data: task, ...taskQuery } = useQuery({
		queryKey: ["tasks", username, taskId],
		queryFn: () => API.getTask(username, taskId),
		refetchInterval: ({ state }) => {
			return state.error ? false : 5_000;
		},
	});
	const { data: workspace, ...workspaceQuery } = useQuery({
		...workspaceByOwnerAndName(username, task?.workspace_name ?? ""),
		enabled: task !== undefined,
		refetchInterval: ({ state }) => {
			return state.error ? false : 5_000;
		},
	});
	const { data: permissions } = useQuery(workspacePermissions(workspace));
	const refetch = taskQuery.error ? taskQuery.refetch : workspaceQuery.refetch;
	const error = taskQuery.error ?? workspaceQuery.error;
	const waitingStatuses: WorkspaceStatus[] = ["starting", "pending"];

	useEffect(() => {
		if (prevTaskRouteKeyRef.current === taskRouteKey) {
			return;
		}
		prevTaskRouteKeyRef.current = taskRouteKey;
		// Reset in-memory follow-up state when navigating to another task route.
		setFollowUpDraft("");
		setFollowUpStage("idle");
		setFollowUpError(undefined);
	}, [taskRouteKey]);

	const startSendingFollowUp = useCallback(
		async (message: string) => {
			setFollowUpStage("sending");
			try {
				await sendFollowUpMutation.mutateAsync(message);
				setFollowUpDraft("");
				setFollowUpError(undefined);
				setFollowUpStage("idle");
			} catch (error) {
				setFollowUpError(getErrorMessage(error, "Failed to send message."));
				setFollowUpStage("error");
			}
		},
		[sendFollowUpMutation],
	);

	const queueFollowUp = useCallback(
		async (message: string) => {
			const trimmedMessage = message.trim();
			if (!trimmedMessage || !task || !workspace) {
				return;
			}

			setFollowUpDraft(trimmedMessage);
			setFollowUpError(undefined);

			if (task.status === "active") {
				void startSendingFollowUp(trimmedMessage);
				return;
			}

			if (
				followUpStage === "resuming" ||
				followUpStage === "waitingForActive" ||
				followUpStage === "sending"
			) {
				return;
			}

			setFollowUpStage("resuming");
			try {
				await resumeFollowUpMutation.mutateAsync();
				await queryClient.invalidateQueries({
					queryKey: ["tasks", task.owner_name, task.id],
				});
				await queryClient.invalidateQueries({
					queryKey: workspaceByOwnerAndNameKey(
						workspace.owner_name,
						workspace.name,
					),
				});
				setFollowUpStage("waitingForActive");
			} catch (error) {
				setFollowUpError(getErrorMessage(error, "Failed to resume task."));
				setFollowUpStage("error");
			}
		},
		[
			followUpStage,
			queryClient,
			resumeFollowUpMutation,
			startSendingFollowUp,
			task,
			workspace,
		],
	);

	const openFollowUpDialog = useCallback(() => {
		setIsFollowUpDialogOpen(true);
	}, []);

	useEffect(() => {
		if (followUpStage !== "resuming" && followUpStage !== "waitingForActive") {
			return;
		}
		if (
			workspace?.latest_build.status === "failed" ||
			workspace?.latest_build.status === "canceled"
		) {
			setFollowUpError(
				"Failed to resume task because the workspace build did not complete successfully.",
			);
			setFollowUpStage("error");
		}
	}, [followUpStage, workspace?.latest_build.status]);

	useEffect(() => {
		// Only auto-send a queued follow-up after we explicitly entered the
		// waiting stage and the task transitions back to active.
		if (
			!followUpDraft ||
			task?.status !== "active" ||
			followUpStage !== "waitingForActive"
		) {
			return;
		}
		void startSendingFollowUp(followUpDraft);
	}, [followUpDraft, followUpStage, startSendingFollowUp, task?.status]);

	if (error) {
		return (
			<TaskPageLayout>
				<title>{pageTitle("Error loading task")}</title>

				<div className="w-full min-h-80 flex items-center justify-center">
					<div className="flex flex-col items-center">
						<h3 className="m-0 font-medium text-content-primary text-base">
							{getErrorMessage(error, "Failed to load task")}
						</h3>
						<span className="text-content-secondary text-sm">
							{getErrorDetail(error)}
						</span>
						<div className="mt-4 flex items-center gap-2">
							<Button size="sm" variant="outline" asChild>
								<RouterLink to="/tasks">
									<ArrowLeftIcon />
									返回任务列表
								</RouterLink>
							</Button>
							<Button size="sm" onClick={() => refetch()}>
								<RotateCcwIcon />
								重试
							</Button>
						</div>
					</div>
				</div>
			</TaskPageLayout>
		);
	}

	if (!task || !workspace) {
		return (
			<TaskPageLayout>
				<title>{pageTitle("Loading task")}</title>
				<Loader className="w-full h-full" />
			</TaskPageLayout>
		);
	}

	let content: ReactNode = null;
	const agent = selectAgent(workspace);

	if (waitingStatuses.includes(workspace.latest_build.status)) {
		content = (
			<BuildingWorkspace
				workspace={workspace}
				onEditPrompt={() => setIsModifyDialogOpen(true)}
			/>
		);
	} else if (workspace.latest_build.status === "failed") {
		content = <TaskBuildFailed task={task} workspace={workspace} />;
	} else if (workspace.latest_build.status === "stopping") {
		content = (
			<TaskTransitioning
				title="正在暂停任务"
				subtitle="您的任务正在暂停..."
			/>
		);
	} else if (
		workspace.latest_build.status === "stopped" ||
		workspace.latest_build.status === "canceled"
	) {
		content = (
			<TaskPaused
				task={task}
				workspace={workspace}
				onEditPrompt={() => setIsModifyDialogOpen(true)}
				onAddFollowUp={openFollowUpDialog}
				followUpDraft={followUpDraft}
				followUpStage={followUpStage}
				followUpError={followUpError}
			/>
		);
	} else if (workspace.latest_build.status === "canceling") {
		content = (
			<TaskTransitioning
				title="正在取消任务"
				subtitle="您的任务正在取消..."
			/>
		);
	} else if (workspace.latest_build.status === "deleting") {
		content = (
			<TaskTransitioning
				title="正在删除任务"
				subtitle="您的工作区正在删除..."
			/>
		);
	} else if (workspace.latest_build.status === "deleted") {
		content = <TaskDeleted />;
	} else if (agent && ["created", "starting"].includes(agent.lifecycle_state)) {
		content = <TaskStartingAgent task={task} agent={agent} />;
	} else {
		const chatApp = getAllAppsWithAgent(workspace).find(
			(app) => app.id === task.workspace_app_id,
		);
		content = (
			<PanelGroup autoSaveId="task" direction="horizontal">
				<Panel defaultSize={25} minSize={20}>
					{chatApp ? (
						<TaskAppIFrame active workspace={workspace} app={chatApp} />
					) : (
						<div className="h-full flex items-center justify-center p-6 text-center">
							<div className="flex flex-col items-center">
								<h3 className="m-0 font-medium text-content-primary text-base">
									未找到聊天应用
								</h3>
								<span className="text-content-secondary text-sm">
									请确保您的模板配置了聊天侧边栏应用。
								</span>
							</div>
						</div>
					)}
				</Panel>
				<PanelResizeHandle>
					<div className="w-1 bg-border h-full hover:bg-border-secondary transition-all relative" />
				</PanelResizeHandle>
				<Panel className="[&>*]:h-full">
					<TaskApps task={task} workspace={workspace} />
				</Panel>
			</PanelGroup>
		);
	}

	return (
		<TaskPageLayout>
			<title>{pageTitle(task.display_name)}</title>

			<TaskTopbar
				task={task}
				workspace={workspace}
				canUpdatePermissions={permissions?.updateWorkspace ?? false}
			/>
			{content}

			<ModifyPromptDialog
				task={task}
				workspace={workspace}
				open={isModifyDialogOpen}
				onOpenChange={setIsModifyDialogOpen}
			/>
			<FollowUpDialog
				task={task}
				initialMessage={followUpDraft}
				open={isFollowUpDialogOpen}
				onOpenChange={setIsFollowUpDialogOpen}
				onSubmit={(message) => {
					void queueFollowUp(message);
				}}
			/>
		</TaskPageLayout>
	);
};

export default TaskPage;

/**
 * Common component for task state messages (paused, deleted, transitioning, etc.)
 * Similar to EmptyState but styled for task states.
 */
type TaskStateMessageProps = {
	title: string;
	description?: string;
	icon?: ReactNode;
	actions?: ReactNode;
	detail?: ReactNode;
};

const TaskStateMessage: FC<TaskStateMessageProps> = ({
	title,
	description,
	icon,
	actions,
	detail,
}) => {
	return (
		<Margins>
			<div className="w-full min-h-80 flex items-center justify-center">
				<div className="flex flex-col items-center text-center">
					<h3 className="m-0 font-medium text-content-primary text-base flex items-center gap-2">
						{icon}
						{title}
					</h3>
					{description && (
						<span className="text-content-secondary text-sm">
							{description}
						</span>
					)}
					{detail}
					{actions && <div className="mt-4">{actions}</div>}
				</div>
			</div>
		</Margins>
	);
};

type TaskTransitioningProps = {
	title: string;
	subtitle: string;
};

const TaskTransitioning: FC<TaskTransitioningProps> = ({ title, subtitle }) => {
	return (
		<TaskStateMessage
			title={title}
			description={subtitle}
			icon={<Spinner loading />}
		/>
	);
};

const TaskDeleted: FC = () => {
	return (
		<TaskStateMessage
			title="任务已删除"
			description="此任务无法恢复。请新建一个任务以继续。"
			actions={
				<Button size="sm" variant="outline" asChild>
					<RouterLink to="/tasks" data-testid="task-create-new">
						新建任务
					</RouterLink>
				</Button>
			}
		/>
	);
};

type TaskLogPreviewProps = {
	logs: readonly TaskLogEntry[];
	maxMessages?: number;
	headerAction?: ReactNode;
	snapshotAt?: string;
};

function logPreviewLabel(count: number): string {
	if (count === 0) {
		return "AI 聊天日志";
	}
	if (count === 1) {
		return "最后一条 AI 聊天日志消息";
	}
	return `最后 ${count} 条 AI 聊天日志消息`;
}

const TaskLogPreview: FC<TaskLogPreviewProps> = ({
	logs,
	headerAction,
	snapshotAt,
}) => {
	// Scroll to the bottom on mount since snapshot logs are static.
	const scrollToBottom = useCallback((el: HTMLDivElement | null) => {
		if (!isChromatic() && el) {
			el.scrollIntoView({ block: "end" });
		}
	}, []);

	return (
		<div className="w-full max-w-screen-lg mx-auto px-16">
			<div className="border border-solid border-border rounded-lg overflow-hidden">
				<div className="flex items-center justify-between px-4 py-2 border-0 border-b border-solid border-border bg-surface-secondary text-sm text-content-secondary">
					<span className="flex items-center gap-1.5">
						{logPreviewLabel(logs.length)}
						{snapshotAt && (
							<InfoTooltip
								type="info"
								message={`此日志快照拍摄于 ${relativeTime(snapshotAt)}。`}
							/>
						)}
					</span>
					{headerAction}
				</div>
				{snapshotAt ? (
					logs.length > 0 ? (
						<ScrollArea className="h-96">
							<div
								ref={scrollToBottom}
								className="p-4 font-mono text-xs text-content-secondary leading-relaxed whitespace-pre-wrap break-words"
							>
								{logs.map((entry, index) => {
									const prev = index === 0 ? undefined : logs[index - 1];
									const isNewGroup = !prev || prev.type !== entry.type;
									return (
										<div
											key={entry.id}
											className={cn(
												"pl-3 border-0 border-l-2 border-solid",
												entry.type === "input"
													? "border-l-border-pending"
													: "border-l-border-purple",
												isNewGroup && index > 0 && "mt-4",
											)}
										>
											{isNewGroup && (
												<div className="text-content-primary font-semibold mb-1">
													{entry.type === "input" ? "[用户]" : "[代理]"}
												</div>
											)}
											{entry.content || "\u00A0"}
										</div>
									);
								})}
							</div>
						</ScrollArea>
					) : (
						<p className="px-4 py-3 text-sm text-content-secondary m-0">
							此快照中没有日志消息。
						</p>
					)
				) : (
					<p className="px-4 py-3 text-sm text-content-secondary m-0">
						没有可用的日志快照。请恢复任务以查看日志。
					</p>
				)}
			</div>
		</div>
	);
};

type TaskBuildFailedProps = {
	task: Task;
	workspace: Workspace;
};

const TaskBuildFailed: FC<TaskBuildFailedProps> = ({ task, workspace }) => {
	const { data: logsData } = useQuery({
		...taskLogs(task.owner_name, task.id),
		retry: false,
	});

	const buildLogsLink = `/@${workspace.owner_name}/${workspace.name}/builds/${workspace.latest_build.build_number}`;

	return (
		<>
			<TaskStateMessage
				title="任务构建失败"
				description="请检查日志以获取更多详细信息。"
				icon={<TriangleAlertIcon className="size-4 text-content-destructive" />}
				actions={
					<Button size="sm" variant="outline" asChild>
						<RouterLink to={buildLogsLink}>查看完整日志</RouterLink>
					</Button>
				}
			/>
			{logsData && (
				<TaskLogPreview
					logs={logsData.logs}
					snapshotAt={logsData.snapshot_at}
					headerAction={
						<Button size="sm" variant="subtle" asChild>
							<RouterLink to={buildLogsLink}>查看完整日志</RouterLink>
						</Button>
					}
				/>
			)}
		</>
	);
};

type TaskPausedProps = {
	task: Task;
	workspace: Workspace;
	onEditPrompt: () => void;
	onAddFollowUp: () => void;
	followUpDraft: string;
	followUpStage: FollowUpStage;
	followUpError?: string;
};

const TaskPaused: FC<TaskPausedProps> = ({
	task,
	workspace,
	onEditPrompt,
	onAddFollowUp,
	followUpDraft,
	followUpStage,
	followUpError,
}) => {
	const queryClient = useQueryClient();

	// Use mutation config directly to customize error handling:
	// API errors are shown in a dialog, other errors show a toast.
	const resumeMutation = useMutation({
		...resumeTask(task, queryClient),
		onError: (error: unknown) => {
			if (!isApiError(error)) {
				toast.error(getErrorMessage(error, "Failed to resume task."), {
					description: getErrorDetail(error),
				});
			}
		},
	});

	const { data: logsData } = useQuery({
		...taskLogs(task.owner_name, task.id),
		retry: false,
	});

	// After requesting a task resume, it may take a while to become ready.
	const isWaitingForStart =
		resumeMutation.isPending || resumeMutation.isSuccess;

	// Determine if this was a timeout (autostop) or manual pause.
	const isTimeout = workspace.latest_build.reason === "autostop";

	const apiError = isApiError(resumeMutation.error)
		? resumeMutation.error
		: undefined;
	const hasPendingFollowUp = followUpDraft.trim().length > 0;
	const isFollowUpSending =
		followUpStage === "resuming" ||
		followUpStage === "waitingForActive" ||
		followUpStage === "sending";
	const followUpStatusLabels: Record<string, string> = {
		resuming: "正在恢复任务...",
		waitingForActive: "等待任务变为活动状态...",
		sending: "正在发送跟进消息...",
	};
	const followUpStatusLabel = followUpStatusLabels[followUpStage];

	return (
		<>
			<TaskStateMessage
				title="任务已暂停"
				description={
					isTimeout
						? "您的任务已超时。请恢复以继续。"
						: "恢复任务以继续。"
				}
				icon={<PauseIcon className="size-4" />}
				detail={
					workspace.outdated && (
						<div
							data-testid="workspace-outdated-tooltip"
							className="flex items-center gap-1.5 mt-1 text-content-secondary text-sm"
						>
							<WorkspaceOutdatedTooltip workspace={workspace}>
								有更新的模板版本可用
							</WorkspaceOutdatedTooltip>
						</div>
					)
				}
				actions={
					<div className="flex flex-col gap-3 items-center">
						<div className="flex flex-row gap-4">
							<Button
								size="sm"
								disabled={isWaitingForStart}
								onClick={() => resumeMutation.mutate()}
							>
								<Spinner loading={isWaitingForStart} />
								恢复
							</Button>
							<Button size="sm" variant="outline" onClick={onEditPrompt}>
								编辑提示
							</Button>
							<Button size="sm" variant="outline" onClick={onAddFollowUp}>
								跟进
							</Button>
						</div>

						{hasPendingFollowUp && (
							<div className="w-full max-w-xl rounded-md border border-border p-3 text-left text-sm">
								<p className="m-0 text-content-primary">
									<strong>待处理跟进：</strong> {followUpDraft}
								</p>
								{followUpStatusLabel && (
									<p className="m-0 mt-2 text-content-secondary flex items-center gap-2">
										<Spinner loading />
										{followUpStatusLabel}
									</p>
								)}
								{followUpError && (
									<p className="m-0 mt-2 text-content-destructive">
										{followUpError}
									</p>
								)}
								<p className="m-0 mt-2 text-content-secondary">
									刷新或离开此页面将清除待处理的跟进消息。
								</p>
							</div>
						)}
						{!hasPendingFollowUp && isFollowUpSending && (
							<p className="m-0 text-content-secondary text-sm">
								<Spinner loading /> 正在处理跟进消息...
							</p>
						)}
					</div>
				}
			/>
			{logsData && (
				<TaskLogPreview
					logs={logsData.logs}
					snapshotAt={logsData.snapshot_at}
					headerAction={
						<Button
							size="sm"
							variant="subtle"
							disabled={isWaitingForStart || isFollowUpSending}
							onClick={() => resumeMutation.mutate()}
						>
							<Spinner loading={isWaitingForStart} />
							恢复以查看完整日志
						</Button>
					}
				/>
			)}

			<WorkspaceErrorDialog
				open={apiError !== undefined}
				error={apiError}
				onClose={resumeMutation.reset}
				showDetail
				workspaceOwner={workspace.owner_name}
				workspaceName={workspace.name}
				templateVersionId={workspace.latest_build.template_version_id}
				isDeleting={false}
			/>
		</>
	);
};

type BuildingWorkspaceProps = {
	workspace: Workspace;
	onEditPrompt: () => void;
};

const BuildingWorkspace: FC<BuildingWorkspaceProps> = ({
	workspace,
	onEditPrompt,
}) => {
	const { data: template } = useQuery(
		templateQueryOptions(workspace.template_id),
	);

	const buildLogs = useWorkspaceBuildLogs(workspace.latest_build.id);

	// If no template yet, use an indeterminate progress bar.
	const transitionStats = (template &&
		getActiveTransitionStats(template, workspace)) || {
		P50: 0,
		P95: null,
	};

	return (
		<section className="p-16 overflow-y-auto">
			<div className="flex justify-center items-center w-full">
				<div className="flex flex-col gap-6 items-center w-full">
					<header className="flex flex-col items-center text-center">
						<h3 className="m-0 font-medium text-content-primary text-xl">
							正在启动您的工作区
						</h3>
						<p className="text-content-secondary m-0">
							您的任务将在片刻后运行
						</p>
					</header>

					<div className="w-full max-w-screen-lg flex flex-col gap-4 overflow-hidden">
						<WorkspaceBuildProgress
							workspace={workspace}
							transitionStats={transitionStats}
							variant="task"
						/>

						<ScrollArea className="h-96 border border-solid border-border rounded-lg">
							<WorkspaceBuildLogs
								sticky
								className="border-0 rounded-none"
								logs={buildLogs ?? []}
							/>
						</ScrollArea>

						<div className="flex flex-col items-center gap-3 mt-4">
							<p className="text-content-secondary text-sm m-0 max-w-md text-center">
								在环境准备期间，您可以编辑提示
							</p>
							<Button size="sm" onClick={onEditPrompt}>
								编辑提示
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

type TaskStartingAgentProps = {
	task: Task;
	agent: WorkspaceAgent;
};

const TaskStartingAgent: FC<TaskStartingAgentProps> = ({ task, agent }) => {
	const logs = useAgentLogs({ agentId: agent.id });
	const listRef = useRef<FixedSizeList>(null);
	const queryClient = useQueryClient();
	const pauseMutation = useMutation({
		...pauseTask(task, queryClient),
		onError: (error: unknown) => {
			toast.error(getErrorMessage(error, "Failed to pause task."), {
				description: getErrorDetail(error),
			});
		},
	});
	const pauseDisabled = isPauseDisabled(task.status);

	useLayoutEffect(() => {
		if (listRef.current) {
			listRef.current.scrollToItem(logs.length - 1, "end");
		}
	}, [logs]);

	return (
		<section className="p-16 overflow-y-auto">
			<div className="flex justify-center items-center w-full">
				<div className="flex flex-col gap-8 items-center w-full">
					<header className="flex flex-col items-center text-center gap-3">
						<div>
							<h3 className="m-0 font-medium text-content-primary text-xl">
								正在运行启动脚本
							</h3>
							<p className="text-content-secondary m-0">
								您的任务将在片刻后运行
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							disabled={pauseDisabled || pauseMutation.isPending}
							onClick={() => pauseMutation.mutate()}
						>
							<Spinner loading={pauseMutation.isPending}>
								<PauseIcon className="size-4" />
							</Spinner>
							暂停
						</Button>
					</header>

					<div className="w-full max-w-screen-lg flex flex-col gap-4 overflow-hidden">
						<div className="h-96 border border-solid border-border rounded-lg">
							<AgentLogs
								ref={listRef}
								sources={agent.log_sources}
								height={96 * 4}
								width="100%"
								overflowed={agent.logs_overflowed}
								logs={logs.map((l) => ({
									id: l.id,
									level: l.level,
									output: l.output,
									sourceId: l.source_id,
									time: l.created_at,
								}))}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

function selectAgent(workspace: Workspace) {
	const agents = workspace.latest_build.resources
		.flatMap((r) => r.agents)
		.filter(Boolean);

	return agents.at(0);
}
