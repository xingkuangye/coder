import { RotateCcwIcon } from "lucide-react";
import { type FC, useState } from "react";
import type { WorkspaceAgent } from "#/api/typesGenerated";
import {
	HelpPopover,
	HelpPopoverAction,
	HelpPopoverContent,
	HelpPopoverLinksGroup,
	HelpPopoverText,
	HelpPopoverTitle,
	HelpPopoverTrigger,
} from "#/components/HelpPopover/HelpPopover";
import { agentVersionStatus } from "../../utils/workspace";

type AgentOutdatedTooltipProps = {
	agent: WorkspaceAgent;
	serverVersion: string;
	status: agentVersionStatus;
	onUpdate: () => void;
};

export const AgentOutdatedTooltip: FC<AgentOutdatedTooltipProps> = ({
	agent,
	serverVersion,
	status,
	onUpdate,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const title =
		status === agentVersionStatus.Outdated
			? "代理版本过旧"
			: "代理已弃用";
	const opener =
		status === agentVersionStatus.Outdated
			? "该代理的版本低于 Coder 服务器版本。"
			: "该代理使用的 API 版本已弃用。";
	const text = `${opener} 这种情况可能发生在您更新 Coder 但仍有正在运行的工作区之后。要解决此问题，您可以停止并启动该工作区。`;

	return (
		<HelpPopover open={isOpen} onOpenChange={setIsOpen}>
			<HelpPopoverTrigger asChild>
				<span role="status" className="cursor-pointer">
					{status === agentVersionStatus.Outdated ? "版本过旧" : "已弃用"}
				</span>
			</HelpPopoverTrigger>
			<HelpPopoverContent>
				<div className="flex flex-col gap-2">
					<div>
						<HelpPopoverTitle>{title}</HelpPopoverTitle>
						<HelpPopoverText>{text}</HelpPopoverText>
					</div>

					<div className="flex flex-col gap-1">
						<span className="font-semibold text-content-primary">
							代理版本
						</span>
						<span>{agent.version}</span>
					</div>

					<div className="flex flex-col gap-1">
						<span className="font-semibold text-content-primary">
							服务器版本
						</span>
						<span>{serverVersion}</span>
					</div>

					<HelpPopoverLinksGroup>
						<HelpPopoverAction
							icon={RotateCcwIcon}
							onClick={() => {
								onUpdate();
								setIsOpen(false);
							}}
							ariaLabel="更新工作区"
						>
							更新工作区
						</HelpPopoverAction>
					</HelpPopoverLinksGroup>
				</div>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
