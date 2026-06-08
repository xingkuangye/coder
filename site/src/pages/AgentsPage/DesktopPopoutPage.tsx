import type { FC } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	DesktopToolbar,
	type ScaleMode,
} from "./components/RightPanel/DesktopToolbar";
import {
	type DesktopConnectionStatus,
	useDesktopConnection,
} from "./hooks/useDesktopConnection";
import { useZoomShortcuts } from "./hooks/useZoomShortcuts";

export default function DesktopPopoutPage() {
	const { agentId } = useParams() as { agentId: string };
	const [scaleMode, setScaleMode] = useState<ScaleMode>("fit");
	const [isControlling, setIsControlling] = useState(false);

	const { status, reconnect, attach } = useDesktopConnection({
		chatId: agentId,
		activated: true,
		scaleViewport: scaleMode === "fit",
	});

	// BroadcastChannel for parent window communication.
	useEffect(() => {
		const channel = new BroadcastChannel(`coder-desktop-${agentId}`);

		channel.postMessage({ type: "popout-opened" });

		// Retry in case the parent's listener registered after this message.
		const retryTimer = setTimeout(() => {
			channel.postMessage({ type: "popout-opened" });
		}, 300);

		channel.addEventListener("message", (event) => {
			if (event.data?.type === "bring-back") {
				close();
			}
		});

		const handleBeforeUnload = () => {
			channel.postMessage({ type: "popout-closed" });
		};
		addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			clearTimeout(retryTimer);
			handleBeforeUnload();
			removeEventListener("beforeunload", handleBeforeUnload);
			channel.close();
		};
	}, [agentId]);

	useZoomShortcuts(setScaleMode);

	return (
		<DesktopPopoutPageView
			status={status}
			reconnect={reconnect}
			attach={attach}
			scaleMode={scaleMode}
			onScaleModeChange={setScaleMode}
			isControlling={isControlling}
			onTakeControl={() => setIsControlling(true)}
			onReleaseControl={() => setIsControlling(false)}
		/>
	);
}

export interface DesktopPopoutPageViewProps {
	status: DesktopConnectionStatus;
	reconnect: () => void;
	attach: (container: HTMLElement) => void;
	scaleMode: ScaleMode;
	onScaleModeChange: (mode: ScaleMode) => void;
	isControlling: boolean;
	onTakeControl: () => void;
	onReleaseControl: () => void;
}

export const DesktopPopoutPageView: FC<DesktopPopoutPageViewProps> = ({
	status,
	reconnect,
	attach,
	scaleMode,
	onScaleModeChange,
	isControlling,
	onTakeControl,
	onReleaseControl,
}) => {
	if (status === "idle" || status === "connecting") {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-surface-primary">
				<div className="flex flex-col items-center gap-2 text-content-secondary">
					<Spinner loading className="h-6 w-6" />
					<span className="text-sm">
						{status === "idle"
							? "正在初始化桌面..."
							: "正在连接桌面..."}
					</span>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-surface-primary">
				<div className="flex flex-col items-center gap-3 text-content-secondary">
					<span className="text-center text-sm">
						连接桌面会话失败。可能代理未连接或桌面环境不可用。
					</span>
					<Button variant="outline" size="sm" onClick={reconnect}>
						重新连接
					</Button>
				</div>
			</div>
		);
	}

	if (status === "disconnected") {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-surface-primary">
				<div className="flex flex-col items-center gap-2 text-content-secondary">
					<Spinner loading className="h-6 w-6" />
					<span className="text-sm">桌面已断开连接，正在重连...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-secondary">
			<DesktopToolbar
				scaleMode={scaleMode}
				onScaleModeChange={onScaleModeChange}
				isControlling={isControlling}
				onTakeControl={onTakeControl}
				onReleaseControl={onReleaseControl}
				isPoppedOut
			/>
			<div
				ref={(el) => {
					if (el) attach(el);
				}}
				className="min-h-0 flex-1 overflow-hidden bg-surface-secondary"
				inert={!isControlling ? true : undefined}
				role="application"
				aria-label={
					isControlling
						? "远程桌面（可交互）"
						: "远程桌面（仅查看，获取控制权以交互）"
				}
			/>
		</div>
	);
};
