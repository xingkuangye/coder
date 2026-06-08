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

export const AIBridgeHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger />

			<HelpPopoverContent>
				<HelpPopoverTitle>什么是 AI 桥接？</HelpPopoverTitle>
				<HelpPopoverText>
					AI 桥接是 AI 的智能网关，为大模型使用提供集中管理、审计和归因。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/ai-coder/ai-bridge")}>
						阅读文档
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
