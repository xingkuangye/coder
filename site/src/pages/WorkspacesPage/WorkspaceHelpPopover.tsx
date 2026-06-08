import type { FC } from "react";
import {
	HelpPopover,
	HelpPopoverContent,
	HelpPopoverIconTrigger,
	HelpPopoverLink,
	HelpPopoverLinksGroup,
	HelpPopoverText,
	HelpPopoverTitle,
} from "#/components/HelpPopover/HelpPopover";
import { docs } from "#/utils/docs";

export const WorkspaceHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger />
			<HelpPopoverContent>
				<HelpPopoverTitle>什么是工作空间？</HelpPopoverTitle>
				<HelpPopoverText>
					工作空间是您在云端的开发环境。它包含了您进行项目工作所需的基础设施和工具。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/user-guides")}>
						创建工作空间
					</HelpPopoverLink>
					<HelpPopoverLink href={docs("/user-guides/workspace-access")}>
						通过 SSH 连接
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
