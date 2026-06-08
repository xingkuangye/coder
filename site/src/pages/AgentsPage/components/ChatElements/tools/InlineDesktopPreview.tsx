import { PanelRightOpenIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	type UseDesktopConnectionResult,
	useDesktopConnection,
} from "#/pages/AgentsPage/hooks/useDesktopConnection";
import { DEFAULT_ASPECT } from "./previewConstants";

/**
 * 非交互式的内联 VNC 桌面预览。noVNC 画布被阻止接收指针/键盘事件，
 * 因此它作为一个只读缩略图。一个不可见的覆盖层捕获点击并将它们转发
 * 到 `onClick`（例如打开侧边栏的桌面选项卡）。
 *
 * 容器的纵横比从远程桌面的帧缓冲区尺寸推导得出，因此预览周围没有
 * 空白区域。
 */
export const InlineDesktopPreview: React.FC<{
	chatId: string;
	onClick?: () => void;
	/** Optional override for the desktop connection hook result.
	 * When provided, the real hook is skipped entirely. Used by
	 * Storybook stories to inject mock connection states without
	 * relying on module-level spies. */
	connectionOverride?: UseDesktopConnectionResult;
}> = ({ chatId, onClick, connectionOverride }) => {
	// Pass undefined chatId when the override is provided so the
	// real hook skips its WebSocket connection logic entirely.
	const realConnection = useDesktopConnection({
		chatId: connectionOverride ? undefined : chatId,
		activated: true,
	});
	const { status, attach } = connectionOverride ?? realConnection;
	const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT);
	const containerRef = useRef<HTMLElement | null>(null);

	// Derive the aspect ratio from the noVNC canvas once connected.
	// noVNC renders into a <canvas> whose intrinsic width/height
	// attributes match the remote framebuffer dimensions (when
	// clipViewport is disabled, which is the case here since
	// scaleViewport is enabled). Querying the canvas from the DOM
	// avoids accessing noVNC's private _fbWidth/_fbHeight fields.
	useEffect(() => {
		if (status !== "connected" || !containerRef.current) {
			return;
		}

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const readDimensions = () => {
			const canvas = containerRef.current?.querySelector("canvas");
			if (canvas && canvas.width > 0 && canvas.height > 0) {
				setAspectRatio(`${canvas.width} / ${canvas.height}`);
				return true;
			}
			return false;
		};

		if (!readDimensions()) {
			// The canvas dimensions may not be set immediately after
			// the status transitions to "connected". Retry once after
			// a short delay as a fallback.
			timeoutId = setTimeout(readDimensions, 500);
		}

		return () => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
		};
	}, [status]);

	const wrapWithOverlay = (children: React.ReactNode) => (
		<div className="group/preview relative">
			{children}
			{/* Transparent overlay — dims the preview on hover and shows
			    a "View desktop" label so it's clear clicking opens the
			    sidebar desktop tab. */}
			{onClick && (
				<button
					type="button"
					onClick={onClick}
					aria-label="打开桌面标签页"
					className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center gap-1.5 border-0 bg-black/0 p-0 transition-colors group-hover/preview:bg-black/50"
				>
					<span className="text-[13px] font-medium text-white opacity-0 drop-shadow-md transition-opacity group-hover/preview:opacity-100">
						查看桌面
					</span>
					<PanelRightOpenIcon className="size-4 text-white opacity-0 drop-shadow-md transition-opacity group-hover/preview:opacity-100" />
				</button>
			)}
		</div>
	);

	if (status === "idle" || status === "connecting") {
		return wrapWithOverlay(
			<div
				className="flex w-full items-center justify-center text-content-secondary"
				style={{ aspectRatio: DEFAULT_ASPECT }}
			>
				<Spinner loading className="h-5 w-5" />
			</div>,
		);
	}

	if (status === "disconnected") {
		return wrapWithOverlay(
			<div
				className="flex w-full items-center justify-center text-xs text-content-secondary"
				style={{ aspectRatio }}
			>
				桌面已断开连接。正在重新连接…
			</div>,
		);
	}

	if (status === "error") {
		return wrapWithOverlay(
			<div
				className="flex w-full items-center justify-center text-xs text-content-secondary"
				style={{ aspectRatio: DEFAULT_ASPECT }}
			>
				无法连接到桌面。
			</div>,
		);
	}

	// status === "connected" — pointer-events-none on the VNC
	// container prevents noVNC from capturing any input.
	return wrapWithOverlay(
		<div
			ref={(el) => {
				containerRef.current = el;
				if (el) attach(el);
			}}
			className="pointer-events-none w-full"
			style={{ aspectRatio }}
		/>,
	);
};
