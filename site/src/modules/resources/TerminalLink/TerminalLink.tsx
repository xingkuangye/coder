import type { FC, MouseEvent } from "react";
import { TerminalIcon } from "#/components/Icons/TerminalIcon";
import { getTerminalHref, openAppInNewWindow } from "#/modules/apps/apps";
import { AgentButton } from "../AgentButton";
import { DisplayAppNameMap } from "../AppLink/AppLink";

interface TerminalLinkProps {
	workspaceName: string;
	agentName?: string;
	userName?: string;
	containerName?: string;
}

/**
 * 生成一个连接到指定工作区代理的终端链接。如果未提供代理，则连接到第一个代理。
 *
 * 如果未提供用户名，则使用 "me"，但这会使链接不可共享。
 */
export const TerminalLink: FC<TerminalLinkProps> = ({
	agentName,
	userName = "me",
	workspaceName,
	containerName,
}) => {
	const href = getTerminalHref({
		username: userName,
		workspace: workspaceName,
		agent: agentName,
		container: containerName,
	});

	return (
		<AgentButton asChild>
			<a
				href={href}
				onClick={(event: MouseEvent<HTMLElement>) => {
					event.preventDefault();
					openAppInNewWindow(href);
				}}
			>
				<TerminalIcon />
				{DisplayAppNameMap.web_terminal}
			</a>
		</AgentButton>
	);
};
