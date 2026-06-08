import type React from "react";
import {
	getProvidedSubagentTitle,
	getSubagentDescriptor,
} from "./subagentDescriptor";
import { asRecord, asString, humanizeMCPToolName, parseArgs } from "./utils";

const renderSubagentLabel = (
	name: string,
	args: unknown,
	result: unknown,
): React.ReactNode | null => {
	const descriptor = getSubagentDescriptor({ name, args, result });
	if (!descriptor) {
		return null;
	}

	const providedTitle = getProvidedSubagentTitle({ args, result });
	const fallbackTitle = descriptor.fallbackTitle;
	const text = (() => {
		switch (descriptor.action) {
			case "spawn":
				if (providedTitle) {
					return `正在生成${providedTitle}`;
				}
				if (descriptor.variant === "explore") {
					return "正在生成探索代理…";
				}
				if (descriptor.variant === "computer_use") {
					return "正在生成计算机使用子代理…";
				}
				return `正在生成${fallbackTitle}…`;
			case "wait":
				return providedTitle
					? `等待${providedTitle}`
					: `等待${fallbackTitle}…`;
			case "message":
				return providedTitle
					? `向${providedTitle}发送消息`
					: `向${fallbackTitle}发送消息…`;
			case "close":
				return providedTitle
					? `正在终止${providedTitle}`
					: `正在终止${fallbackTitle}`;
		}
	})();

	return <span className="truncate text-[13px]">{text}</span>;
};

export const ToolLabel: React.FC<{
	name: string;
	args: unknown;
	result: unknown;
	mcpSlug?: string;
}> = ({ name, args, result, mcpSlug }) => {
	const parsed = parseArgs(args);
	const parsedResult = asRecord(result);
	const subagentLabel = renderSubagentLabel(
		name,
		parsed ?? args,
		parsedResult ?? result,
	);
	if (subagentLabel) {
		return subagentLabel;
	}

	switch (name) {
		case "execute": {
			const command = parsed ? asString(parsed.command) : "";
			if (command) {
				return (
					<code className="truncate font-mono text-xs text-content-primary">
						{command}
					</code>
				);
			}
			return <span className="truncate text-[13px]">正在运行命令</span>;
		}
		case "process_output":
			return (
				<span className="truncate text-[13px]">正在读取进程输出</span>
			);
		case "process_signal": {
			const signal = parsed ? asString(parsed.signal) : "";
			const processId = parsed ? asString(parsed.process_id) : "";
			const shortId = processId ? processId.slice(0, 8) : "";
			const hasResult = result !== undefined && result !== null;
			const success = parsedResult ? Boolean(parsedResult.success) : false;
			if (hasResult && success) {
				const verb = signal === "kill" ? "已终止" : "已终止";
				return (
					<span className="truncate text-[13px]">
						{verb} 进程{shortId ? ` ${shortId}` : ""}
					</span>
				);
			}
			if (hasResult && !success) {
				const verb =
					signal === "kill"
						? "kill"
						: signal === "terminate"
							? "terminate"
							: "signal";
				return (
					<span className="truncate text-[13px]">
						无法{verb}进程{shortId ? ` ${shortId}` : ""}
					</span>
				);
			}
			return (
				<span className="truncate text-[13px]">
					{signal === "kill"
						? "正在终止进程…"
						: signal === "terminate"
							? "正在终止进程…"
							: "正在发送信号…"}
				</span>
			);
		}
		case "process_list":
			return <span className="truncate text-[13px]">列出进程</span>;
		case "read_file":
			return <span className="truncate text-[13px]">正在读取文件…</span>;
		case "write_file": {
			const path = parsed ? asString(parsed.path) : "";
			if (path) {
				return (
					<code className="truncate font-mono text-xs text-content-primary">
						{path}
					</code>
				);
			}
			return <span className="truncate text-[13px]">正在写入文件</span>;
		}
		case "edit_files": {
			const files = parsed?.files;
			if (Array.isArray(files) && files.length === 1) {
				const path = asString((files[0] as Record<string, unknown>)?.path);
				if (path) {
					return (
						<code className="truncate font-mono text-xs text-content-primary">
							{path}
						</code>
					);
				}
			}
			return <span className="truncate text-[13px]">正在编辑文件</span>;
		}
		case "create_workspace": {
			const wsName = parsedResult ? asString(parsedResult.workspace_name) : "";
			if (wsName) {
				return <span className="truncate text-[13px]">已创建{wsName}</span>;
			}
			return <span className="truncate text-[13px]">正在创建工作区</span>;
		}
		case "list_templates": {
			const count = parsedResult
				? ((parsedResult.count as number | undefined) ?? 0)
				: 0;
			return (
				<span className="truncate text-[13px]">
					{count === 0
						? "列出模板…"
						: count === 1
							? "已列出 1 个模板"
							: `已列出 ${count} 个模板`}
				</span>
			);
		}
		case "read_template": {
			const templateRec = parsedResult
				? asRecord(parsedResult.template)
				: undefined;
			const tmplName = templateRec
				? asString(templateRec.display_name) || asString(templateRec.name)
				: "";
			return (
				<span className="truncate text-[13px]">
					{tmplName ? `已读取模板 ${tmplName}` : "正在读取模板…"}
				</span>
			);
		}
		case "chat_summarized":
			return <span className="truncate text-[13px]">已总结</span>;
		case "attach_file": {
			const attachedName =
				(parsedResult ? asString(parsedResult.name) : "") ||
				(parsed ? asString(parsed.name) : "") ||
				(parsed ? asString(parsed.path).split("/").pop() : "") ||
				"file";
			return (
				<span className="truncate text-[13px]">{`已附加 ${attachedName}`}</span>
			);
		}
		case "computer":
			return <span className="truncate text-[13px]">截图</span>;
		case "propose_plan": {
			const path = parsed ? asString(parsed.path) || "PLAN.md" : "PLAN.md";
			const filename = path.split("/").pop() || "PLAN.md";
			return <span className="truncate text-[13px]">{filename}</span>;
		}
		case "advisor":
			return (
				<span className="truncate text-[13px] leading-4 text-content-secondary">
					顾问
				</span>
			);
		case "read_skill": {
			const skillName = parsed ? asString(parsed.name) : "";
			return (
				<span className="truncate text-[13px]">
					{skillName
						? parsedResult
							? `已读取技能 ${skillName}`
							: `正在读取技能 ${skillName}…`
						: "正在读取技能…"}
				</span>
			);
		}
		case "read_skill_file": {
			const skillName = parsed ? asString(parsed.name) : "";
			const filePath = parsed ? asString(parsed.path) : "";
			const label =
				skillName && filePath
					? `${skillName}/${filePath}`
					: skillName || filePath || "技能文件";
			return (
				<span className="truncate text-[13px]">
					{parsedResult ? `已读取 ${label}` : `正在读取 ${label}…`}
				</span>
			);
		}
		case "start_workspace": {
			const wsName = parsedResult ? asString(parsedResult.workspace_name) : "";
			return (
				<span className="truncate text-[13px]">
					{wsName ? `已启动 ${wsName}` : "正在启动工作区…"}
				</span>
			);
		}

		default: {
			const displayName = mcpSlug ? humanizeMCPToolName(mcpSlug, name) : name;
			return <span className="truncate text-[13px]">{displayName}</span>;
		}
	}
};
