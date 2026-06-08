import { type CSSProperties, type FC, useState } from "react";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { cn } from "#/utils/cn";
import { chatWidthClass, useChatFullWidth } from "../hooks/useChatFullWidth";
import { loadPersistedLeftSidebarWidth } from "./ChatsSidebar/sidebarWidth";

/** localStorage keys shared with the agents panel components. */
const RIGHT_PANEL_OPEN_KEY = "agents.right-panel-open";
const RIGHT_PANEL_WIDTH_KEY = "agents.right-panel-width";
const DEFAULT_PANEL_WIDTH = 480;
const MIN_PANEL_WIDTH = 360;

/** Read persisted right-panel state for use in static skeletons. */
function getRightPanelState(): { open: boolean; width: number } {
	const open = localStorage.getItem(RIGHT_PANEL_OPEN_KEY) === "true";
	const stored = localStorage.getItem(RIGHT_PANEL_WIDTH_KEY);
	let width = DEFAULT_PANEL_WIDTH;
	if (stored) {
		const parsed = Number.parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed >= MIN_PANEL_WIDTH) {
			width = parsed;
		}
	}
	return { open, width };
}

/**
 * 在 AgentsPage 代码块加载时显示的骨架屏。模拟侧边栏 + 空白主区域的布局，
 * 让用户立即看到结构，而不是全屏加载动画。
 */
export const AgentsPageSkeleton: FC = () => {
	const [leftSidebarWidth] = useState(() => loadPersistedLeftSidebarWidth());

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-primary sm:flex-row">
			<div
				style={
					{
						"--agents-left-sidebar-width": `${leftSidebarWidth}px`,
					} as CSSProperties
				}
				className="order-2 sm:order-none flex-1 min-h-0 border-t border-border-default sm:flex-none sm:border-t-0 sm:h-full sm:w-[var(--agents-left-sidebar-width)] sm:min-w-[240px] sm:max-w-[min(520px,50vw)] sm:min-h-0 sm:border-b-0"
			>
				<div className="relative flex size-full min-h-0 border-0 border-r border-solid overflow-hidden">
					<div className="absolute inset-0 flex flex-col">
						<div className="hidden border-b border-border-default px-2 pb-3 pt-1.5 sm:block">
							<div className="mb-2.5 flex items-center justify-between">
								<Skeleton className="size-6 rounded" />
								<div className="flex items-center gap-0.5 -mr-1.5">
									<Skeleton className="size-7 rounded" />
									<Skeleton className="size-7 rounded" />
									<Skeleton className="size-7 rounded" />
								</div>
							</div>
							<Skeleton className="h-9 w-full rounded-md" />
						</div>
						<div className="flex flex-col gap-2 px-2 py-3">
							<Skeleton className="ml-2.5 h-3.5 w-16" />
							<div className="flex flex-col gap-0.5">
								{Array.from({ length: 6 }, (_, i) => (
									<div
										key={i}
										className="flex items-start gap-2 rounded-md px-2 py-1"
									>
										<Skeleton className="mt-0.5 size-5 shrink-0 rounded-md" />
										<div className="min-w-0 flex-1 space-y-1.5">
											<Skeleton
												className="h-3.5"
												style={{ width: `${55 + ((i * 17) % 35)}%` }}
											/>
											<Skeleton className="h-3 w-20" />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface-primary order-1 sm:order-none" />
		</div>
	);
};

/**
 * 聊天对话的骨架屏占位符：两条用户消息气泡与助手的回复行交错排列。
 */
export const ChatConversationSkeleton: FC = () => (
	<div className="flex flex-col gap-3">
		{/* User message bubble (right-aligned) */}
		<div className="flex w-full justify-end">
			<Skeleton className="h-10 w-2/3 rounded-lg" />
		</div>
		{/* Assistant response lines (left-aligned) */}
		<div className="space-y-3">
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
			<Skeleton className="h-4 w-4/6" />
		</div>
		{/* Second user message bubble */}
		<div className="mt-3 flex w-full justify-end">
			<Skeleton className="h-10 w-1/2 rounded-lg" />
		</div>
		{/* Second assistant response */}
		<div className="space-y-3">
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-5/6" />
			<Skeleton className="h-4 w-4/6" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-3/5" />
		</div>
	</div>
);

/**
 * 右侧边栏面板的骨架屏占位符：一个标签栏和几行内容。
 */
export const RightPanelSkeleton: FC = () => (
	<div className="flex h-full min-w-0 flex-col overflow-hidden bg-surface-primary">
		{/* Skeleton tab bar */}
		<div className="flex shrink-0 items-center gap-2 border-0 border-b border-solid border-border-default px-3 py-1">
			<Skeleton className="h-6 w-12 rounded-md" />
			<div className="flex-1" />
		</div>
		{/* Skeleton panel content */}
		<div className="space-y-4 p-4">
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-3/4" />
		</div>
	</div>
);

/**
 * Skeleton placeholder for the chat input area. Matches the layout of
 * the real AgentChatInput so the transition from Suspense fallback to
 * the loaded component doesn't cause a vertical layout shift.
 */
const ChatInputSkeleton: FC<{ fullWidth: boolean }> = ({ fullWidth }) => (
	<div className="shrink-0 overflow-y-auto px-4 [scrollbar-gutter:stable] [scrollbar-width:thin]">
		<div
			className={cn("mx-auto w-full pb-0 sm:pb-4", chatWidthClass(fullWidth))}
		>
			<div className="rounded-2xl border border-border-default/80 bg-surface-secondary/45 p-1 shadow-sm">
				<div className="min-h-[60px] sm:min-h-24 px-3 py-2" />
				<div className="flex items-center justify-between gap-2 px-2.5 pb-1.5">
					<Skeleton className="h-6 w-24 rounded" />
					<Skeleton className="size-7 rounded-full" />
				</div>
			</div>
		</div>
	</div>
);

/**
 * 在 AgentChatPage 代码块加载时显示的骨架屏。模拟顶部栏 + 聊天对话布局，
 * 让用户在短暂的 Suspense 回退期间看到可导航的结构。
 */
export const AgentChatPageSkeleton: FC = () => {
	const rightPanel = getRightPanelState();
	const [chatFullWidth] = useChatFullWidth();

	return (
		<div
			className={cn(
				"relative flex h-full min-h-0 min-w-0 flex-1",
				rightPanel.open && "flex-row",
			)}
		>
			<div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
				<div className="flex shrink-0 items-center gap-2 px-4 py-1.5">
					<Skeleton className="size-7 rounded" />
					<Skeleton className="h-4 w-32" />
					<div className="flex-1" />
					<Skeleton className="size-7 rounded" />
					<Skeleton className="size-7 rounded" />
				</div>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="px-4">
						<div
							className={cn(
								"mx-auto w-full py-6",
								chatWidthClass(chatFullWidth),
							)}
						>
							<ChatConversationSkeleton />
						</div>
					</div>
				</div>
				<ChatInputSkeleton fullWidth={chatFullWidth} />
			</div>
			{rightPanel.open && (
				<div
					style={
						{
							"--panel-width": `${rightPanel.width}px`,
						} as React.CSSProperties
					}
					className="relative flex h-full w-[100vw] min-w-0 flex-col border-0 border-l border-solid border-border-default sm:w-[var(--panel-width)] sm:min-w-[360px] sm:max-w-[70vw]"
				>
					<RightPanelSkeleton />
				</div>
			)}
		</div>
	);
};
