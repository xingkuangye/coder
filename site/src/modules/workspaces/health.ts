import type { WorkspaceAgent } from "#/api/typesGenerated";

/**
 * Canonical messages for startup and shutdown script issues.
 * Used by the per-agent-row tooltips in AgentStatus; the
 * start-related entries are also shared with per-agent health
 * classification in getAgentHealthIssues.
 */
export const agentScriptMessages = {
	start_error: {
		title: "启动脚本失败",
		detail:
			"启动脚本以错误退出。请检查代理日志了解详情。",
	},
	start_timeout: {
		title: "启动脚本花费的时间比预期长",
		detail:
			"启动脚本已超过预期时间。请检查代理日志了解详情。",
	},
	shutdown_error: {
		title: "关闭脚本失败",
		detail:
			"关闭脚本以错误退出。请检查代理日志了解详情。",
	},
	shutdown_timeout: {
		title: "关闭脚本花费的时间比预期长",
		detail:
			"关闭脚本已超过预期时间。请检查代理日志了解详情。",
	},
} as const;

/**
 * Canonical messages for agent connection issues (the agent
 * process connecting to the Coder control plane).
 */
export const agentConnectionMessages = {
	connecting: {
		title: "工作区代理正在连接",
		detail:
			"工作区代理尚未连接。请等待其连接，或者如果未连接则检查日志。",
	},
	timeout: {
		title: "代理连接花费的时间比预期长",
		detail:
			"继续等待并检查日志输出中的错误。如果代理未连接，请尝试重新启动工作区。",
	},
	disconnected: {
		title: "工作区代理已断开连接",
		detail:
			"检查日志输出中的错误。如果代理未重新连接，请尝试重新启动工作区。",
	},
} as const;

interface AgentHealthIssue {
	title: string;
	detail: string;
	severity: "info" | "warning";
	// Whether the alert should be visually prominent. Usually true for
	// warnings, but connection timeout and startup timeout are
	// exceptions (warning severity without prominent styling).
	prominent: boolean;
}

/**
 * Classifies all health issues for an individual agent.
 */
export function getAgentHealthIssues(
	agent: WorkspaceAgent,
): AgentHealthIssue[] {
	const issues: AgentHealthIssue[] = [];

	if (agent.status === "disconnected") {
		issues.push({
			title: agentConnectionMessages.disconnected.title,
			detail: agentConnectionMessages.disconnected.detail,
			severity: "warning",
			prominent: false,
		});
	}

	if (agent.status === "timeout") {
		issues.push({
			title: agentConnectionMessages.timeout.title,
			detail: agentConnectionMessages.timeout.detail,
			severity: "warning",
			prominent: false,
		});
	}

	if (
		agent.lifecycle_state === "shutting_down" ||
		agent.lifecycle_state === "shutdown_error" ||
		agent.lifecycle_state === "shutdown_timeout"
	) {
		issues.push({
			title: "工作区代理正在关闭",
			detail: "代理关闭期间，工作区不可用。",
			severity: "info",
			prominent: false,
		});
	}

	// Ignore `start_error` and `start_timeout`, as these will eventually be
	// removed from agent health.  Instead, figure out if a script failed to start
	// by looking directly at the scripts.
	for (const script of agent.scripts) {
		switch (script.status) {
			case "timed_out":
				issues.push({
					title: `"${script.display_name}" 花费的时间比预期长`,
					detail: `"${script.display_name}" 已超过预期时间。请检查代理日志了解详情。`,
					severity: "warning",
					prominent: false,
				});
				break;
			case "exit_failure":
				if (script.exit_code) {
					issues.push({
						title: `"${script.display_name}" 失败`,
						detail: `"${script.display_name}" 以代码 ${script.exit_code} 退出。请检查代理日志了解详情。`,
						severity: "warning",
						prominent: false,
					});
				} else {
					issues.push({
						title: `"${script.display_name}" 失败`,
						detail: `"${script.display_name}" 已因错误退出。请检查代理日志了解详情。`,
						severity: "warning",
						prominent: false,
					});
				}
				break;
			case "pipes_left_open":
				issues.push({
					title: `"${script.display_name}" 留有未关闭的管道`,
					detail: "请检查代理日志了解详情。",
					severity: "warning",
					prominent: false,
				});
				break;
		}
	}

	if (agent.status === "connecting") {
		issues.push({
			title: agentConnectionMessages.connecting.title,
			detail: agentConnectionMessages.connecting.detail,
			severity: "info",
			prominent: false,
		});
	}

	return issues;
}
