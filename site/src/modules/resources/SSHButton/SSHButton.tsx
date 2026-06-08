import type { FC } from "react";
import { useQuery } from "react-query";
import { deploymentSSHConfig } from "#/api/queries/deployment";
import { ChevronDownIcon } from "#/components/AnimatedIcons/ChevronDown";
import { Button } from "#/components/Button/Button";
import { CodeExample } from "#/components/CodeExample/CodeExample";
import {
	HelpPopoverLink,
	HelpPopoverLinksGroup,
	HelpPopoverText,
} from "#/components/HelpPopover/HelpPopover";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/Popover/Popover";
import { docs } from "#/utils/docs";

interface AgentSSHButtonProps {
	workspaceName: string;
	agentName: string;
	workspaceOwnerUsername: string;
}

export const AgentSSHButton: FC<AgentSSHButtonProps> = ({
	workspaceName,
	agentName,
	workspaceOwnerUsername,
}) => {
	const { data } = useQuery(deploymentSSHConfig());
	const sshSuffix = data?.hostname_suffix;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="sm" variant="subtle">
					通过 SSH 连接
					<ChevronDownIcon />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="py-4 px-6 w-80 text-content-secondary mt-[2px] bg-surface-secondary"
			>
				<HelpPopoverText>
					运行以下命令以通过 SSH 连接：
				</HelpPopoverText>

				<ol style={{ margin: 0, padding: 0 }}>
					<div className="flex flex-col gap-1 mt-3">
						<SSHStep
							helpText="在机器上配置 SSH 主机："
							codeExample="coder config-ssh"
						/>
						<SSHStep
							helpText="连接到代理："
							codeExample={`ssh ${agentName}.${workspaceName}.${workspaceOwnerUsername}.${sshSuffix}`}
						/>
					</div>
				</ol>

				<HelpPopoverLinksGroup>
					<HelpPopoverLink href="/install">安装 Coder CLI</HelpPopoverLink>
					<HelpPopoverLink href={docs("/user-guides/workspace-access/vscode")}>
						通过 VS Code Remote SSH 连接
					</HelpPopoverLink>
					<HelpPopoverLink
						href={docs("/user-guides/workspace-access/jetbrains")}
					>
						通过 JetBrains IDE 连接
					</HelpPopoverLink>
					<HelpPopoverLink href={docs("/user-guides/desktop")}>
						通过 Coder Desktop 连接
					</HelpPopoverLink>
					<HelpPopoverLink href={docs("/user-guides/workspace-access#ssh")}>
						SSH 配置
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</PopoverContent>
		</Popover>
	);
};

interface SSHStepProps {
	helpText: string;
	codeExample: string;
}

const SSHStep: FC<SSHStepProps> = ({ helpText, codeExample }) => (
	<li style={{ listStylePosition: "inside" }}>
		<HelpPopoverText style={{ display: "inline" }}>
			<strong className="text-xs">{helpText}</strong>
		</HelpPopoverText>
		<CodeExample secret={false} code={codeExample} />
	</li>
);
