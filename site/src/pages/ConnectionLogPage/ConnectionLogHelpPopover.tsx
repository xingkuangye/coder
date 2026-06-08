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

export const ConnectionLogHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger />

			<HelpPopoverContent>
				<HelpPopoverTitle>为什么缺少了一些事件？</HelpPopoverTitle>
				<HelpPopoverText>
					连接日志是一个尽力而为的工作区访问日志。某些事件由工作区代理报告，服务器对这些事件的接收并不保证。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/admin/monitoring/connection-logs")}>
						连接日志文档
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
