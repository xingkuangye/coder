import { RefreshCwIcon } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import type { WorkspaceAgent } from "#/api/typesGenerated";
import {
	Alert,
	type AlertColor,
	type AlertProps,
} from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Link } from "#/components/Link/Link";
import { cn } from "#/utils/cn";
import { docs } from "#/utils/docs";
import type { ConnectionStatus } from "./types";

type WorkspaceTerminalAlertsProps = {
	agent: WorkspaceAgent | undefined;
	status: ConnectionStatus;
	onAlertChange: () => void;
};

export const WorkspaceTerminalAlerts = ({
	agent,
	status,
	onAlertChange,
}: WorkspaceTerminalAlertsProps) => {
	const lifecycleState = agent?.lifecycle_state;
	const prevLifecycleState = useRef(lifecycleState);
	useEffect(() => {
		prevLifecycleState.current = lifecycleState;
	}, [lifecycleState]);

	// MutationObserver triggers onAlertChange after DOM updates so
	// the terminal can refit once alert height changes.
	const wrapperRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!wrapperRef.current) {
			return;
		}
		const observer = new MutationObserver(onAlertChange);
		observer.observe(wrapperRef.current, { childList: true });

		return () => {
			observer.disconnect();
		};
	}, [onAlertChange]);

	return (
		<div ref={wrapperRef}>
			{status === "disconnected" ? (
				<DisconnectedAlert />
			) : lifecycleState === "start_error" ? (
				<ErrorScriptAlert />
			) : lifecycleState === "starting" ? (
				<LoadingScriptsAlert />
			) : lifecycleState === "ready" &&
				prevLifecycleState.current === "starting" ? (
				<LoadedScriptsAlert />
			) : null}
		</div>
	);
};

const ErrorScriptAlert: FC = () => {
	return (
		<TerminalAlert
			severity="warning"
			dismissible
			actions={<RefreshSessionButton />}
		>
			工作空间{" "}
			<Link
				title="启动脚本已退出并报错"
				href={docs(
					"/admin/templates/troubleshooting#startup-script-exited-with-an-error",
				)}
				target="_blank"
				rel="noreferrer"
				className="mx-0"
			>
				启动脚本已退出并报错
			</Link>
			，我们建议重新加载此会话并{" "}
			<Link
				title=" 调试启动脚本"
				href={docs("/admin/templates/troubleshooting#startup-script-issues")}
				target="_blank"
				rel="noreferrer"
			>
				调试启动脚本
			</Link>{" "}
			因为{" "}
			<Link
				title="您的工作空间可能不完整。"
				href={docs(
					"/admin/templates/troubleshooting#your-workspace-may-be-incomplete",
				)}
				target="_blank"
				rel="noreferrer"
			>
				您的工作空间可能不完整。
			</Link>{" "}
		</TerminalAlert>
	);
};

const LoadingScriptsAlert: FC = () => {
	return (
		<TerminalAlert
			dismissible
			severity="info"
			actions={<RefreshSessionButton />}
		>
			启动脚本仍在运行。您可以继续使用此终端，但是{" "}
			<Link
				title="您的工作空间可能不完整。"
				href={docs(
					"/admin/templates/troubleshooting#your-workspace-may-be-incomplete",
				)}
				target="_blank"
				rel="noreferrer"
			>
				{" "}
				您的工作空间可能不完整。
			</Link>
		</TerminalAlert>
	);
};

const LoadedScriptsAlert: FC = () => {
	return (
		<TerminalAlert
			severity="success"
			dismissible
			actions={<RefreshSessionButton />}
		>
			启动脚本已成功完成。工作空间已就绪，但是此{" "}
			<Link
				title="会话是在启动脚本完成之前启动的"
				href={docs(
					"/admin/templates/troubleshooting#your-workspace-may-be-incomplete",
				)}
				target="_blank"
				rel="noreferrer"
			>
				会话是在启动脚本完成之前启动的。
			</Link>{" "}
			为了确保您的 shell 环境是最新的，我们建议重新加载此会话。
		</TerminalAlert>
	);
};

const severityBorderColors: Record<AlertColor, string> = {
	info: "border-l-highlight-sky",
	success: "border-l-content-success",
	warning: "border-l-content-warning",
	error: "border-l-content-destructive",
};

const TerminalAlert: FC<AlertProps> = (props) => {
	const severity = props.severity ?? "info";
	return (
		<Alert
			{...props}
			className={cn(
				"rounded-none border-0 border-b border-l-[3px] border-b-border-default bg-surface-primary mb-px",
				severityBorderColors[severity],
			)}
		/>
	);
};

// Since the terminal connection is always trying to reconnect, we show this
// alert to indicate that the terminal is trying to connect.
const DisconnectedAlert: FC<AlertProps> = (props) => {
	return (
		<TerminalAlert
			{...props}
			severity="info"
			actions={<RefreshSessionButton />}
		>
			正在尝试连接...
		</TerminalAlert>
	);
};

const RefreshSessionButton: FC = () => {
	const [isRefreshing, setIsRefreshing] = useState(false);

	return (
		<Button
			disabled={isRefreshing}
			size="sm"
			onClick={() => {
				setIsRefreshing(true);
				location.reload();
			}}
		>
			<RefreshCwIcon className={cn(isRefreshing && "animate-spin")} />
			{isRefreshing ? "正在刷新会话..." : "刷新会话"}
		</Button>
	);
};
