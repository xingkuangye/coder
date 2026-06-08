import { RotateCcwIcon } from "lucide-react";
import type { FC } from "react";
import type {
	WorkspaceAgent,
	WorkspaceAgentDevcontainer,
} from "#/api/typesGenerated";
import {
	HelpPopover,
	HelpPopoverAction,
	HelpPopoverContent,
	HelpPopoverLinksGroup,
	HelpPopoverText,
	HelpPopoverTitle,
	HelpPopoverTrigger,
} from "#/components/HelpPopover/HelpPopover";

type SubAgentOutdatedTooltipProps = {
	devcontainer: WorkspaceAgentDevcontainer;
	agent: WorkspaceAgent;
	onUpdate: () => void;
};

export const SubAgentOutdatedTooltip: FC<SubAgentOutdatedTooltipProps> = ({
	devcontainer,
	agent,
	onUpdate,
}) => {
	if (!devcontainer.agent || devcontainer.agent.id !== agent.id) {
		return null;
	}
	if (!devcontainer.dirty) {
		return null;
	}

	return (
		<HelpPopover>
			<HelpPopoverTrigger className="px-0 py-1 bg-transparent text-inherit border-none opacity-50 hover:opacity-100">
				<span role="status" className="cursor-pointer">
					已过时
				</span>
			</HelpPopoverTrigger>
			<HelpPopoverContent>
				<div className="flex flex-col gap-2">
					<div>
						<HelpPopoverTitle>开发容器已过时</HelpPopoverTitle>
						<HelpPopoverText>
							此开发容器已过时。如果您在创建开发容器后修改了 devcontainer.json 文件，可能会出现这种情况。
							要解决此问题，您可以重建开发容器。
						</HelpPopoverText>
					</div>

					<HelpPopoverLinksGroup>
						<HelpPopoverAction
							icon={RotateCcwIcon}
							onClick={onUpdate}
							ariaLabel="重建开发容器"
						>
							重建开发容器
						</HelpPopoverAction>
					</HelpPopoverLinksGroup>
				</div>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
