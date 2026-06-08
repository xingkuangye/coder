import { ExternalLinkIcon } from "lucide-react";
import type { FC } from "react";
import { useEffect, useState } from "react";

import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	type DesktopConnectionStatus,
	useDesktopConnection,
} from "../../hooks/useDesktopConnection";
import { useZoomShortcuts } from "../../hooks/useZoomShortcuts";
import { DesktopToolbar, type ScaleMode } from "./DesktopToolbar";

interface DesktopPanelProps {
	chatId: string;
	/** When true the panel is the active sidebar tab. */
	isVisible?: boolean;
}

export const DesktopPanel: FC<DesktopPanelProps> = ({ chatId, isVisible }) => {
	// Delay the VNC connection until the desktop tab is first selected.
	// Once activated, the connection stays alive even when the tab is
	// switched away.
	const [activated, setActivated] = useState(false);
	if (isVisible && !activated) {
		setActivated(true);
	}

	const [isControlling, setIsControlling] = useState(false);
	if (!isVisible && isControlling) {
		setIsControlling(false);
	}

	const [scaleMode, setScaleMode] = useState<ScaleMode>("fit");
	const [isPoppedOut, setIsPoppedOut] = useState(false);

	const { status, reconnect, attach } = useDesktopConnection({
		chatId: isPoppedOut ? undefined : chatId,
		activated: activated && !isPoppedOut,
		scaleViewport: scaleMode === "fit",
	});

	useZoomShortcuts(setScaleMode, isVisible);

	// Listen for BroadcastChannel messages from the pop-out window.
	useEffect(() => {
		const channel = new BroadcastChannel(`coder-desktop-${chatId}`);

		channel.addEventListener("message", (event) => {
			if (event.data?.type === "popout-opened") {
				setIsPoppedOut(true);
				setIsControlling(false);
			} else if (event.data?.type === "popout-closed") {
				setIsPoppedOut(false);
			}
		});

		return () => channel.close();
	}, [chatId]);

	const handlePopOut = () => {
		const width = Math.round(screen.availWidth * 0.5);
		const height = Math.round(screen.availHeight * 0.5);
		const left = Math.round((screen.availWidth - width) / 2);
		const top = Math.round((screen.availHeight - height) / 2);
		open(
			`/agents/${chatId}/desktop`,
			`coder-desktop-${chatId}`,
			`popup,width=${width},height=${height},left=${left},top=${top}`,
		);
	};

	const handleBringBack = () => {
		const channel = new BroadcastChannel(`coder-desktop-${chatId}`);
		channel.postMessage({ type: "bring-back" });
		channel.close();
		setIsPoppedOut(false);
	};

	if (isPoppedOut) {
		return (
			<div
				className="flex h-full flex-col items-center justify-center gap-3 text-content-secondary"
				role="status"
			>
				<ExternalLinkIcon className="h-8 w-8" />
				<span className="text-sm">桌面在独立窗口中打开。</span>
				<Button variant="outline" size="sm" onClick={handleBringBack}>
					收回
				</Button>
			</div>
		);
	}

	return (
		<DesktopPanelView
			status={status}
			reconnect={reconnect}
			attach={attach}
			scaleMode={scaleMode}
			onScaleModeChange={setScaleMode}
			isControlling={isControlling}
			onTakeControl={() => setIsControlling(true)}
			onReleaseControl={() => setIsControlling(false)}
			onPopOut={handlePopOut}
		/>
	);
};

export interface DesktopPanelViewProps {
	status: DesktopConnectionStatus;
	reconnect: () => void;
	attach: (container: HTMLElement) => void;
	scaleMode: ScaleMode;
	onScaleModeChange: (mode: ScaleMode) => void;
	isControlling: boolean;
	onTakeControl: () => void;
	onReleaseControl: () => void;
	onPopOut?: () => void;
}

export const DesktopPanelView: FC<DesktopPanelViewProps> = ({
	status,
	reconnect,
	attach,
	scaleMode,
	onScaleModeChange,
	isControlling,
	onTakeControl,
	onReleaseControl,
	onPopOut,
}) => {
	if (status === "connecting") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 text-content-secondary">
				<Spinner loading className="h-6 w-6" />
				<span className="text-sm">正在连接桌面...</span>
			</div>
		);
	}

	if (status === "disconnected") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 text-content-secondary">
				<Spinner loading className="h-6 w-6" />
				<span className="text-sm">桌面已断开，正在重连...</span>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 text-content-secondary">
				<span className="text-center text-sm">
					无法连接到桌面会话。代理可能未连接或桌面环境不可用。
				</span>
				<Button variant="outline" size="sm" onClick={reconnect}>
					重新连接
				</Button>
			</div>
		);
	}

	if (status === "idle") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 text-content-secondary">
				<Spinner loading className="h-6 w-6" />
				<span className="text-sm">正在初始化桌面...</span>
			</div>
		);
	}

	// status === "connected"
	return (
		<div className="flex h-full w-full flex-col">
			<DesktopToolbar
				scaleMode={scaleMode}
				onScaleModeChange={onScaleModeChange}
				isControlling={isControlling}
				onTakeControl={onTakeControl}
				onReleaseControl={onReleaseControl}
				onPopOut={onPopOut}
			/>

			<div className="min-h-0 flex-1 overflow-hidden bg-surface-secondary">
				<div
					ref={(el) => {
						if (el) attach(el);
					}}
					className="h-full w-full"
					inert={!isControlling ? true : undefined}
					role="application"
					aria-label={
						isControlling
							? "远程桌面（可交互）"
							: "远程桌面（仅查看，接管控制以交互）"
					}
				/>
			</div>
		</div>
	);
};
