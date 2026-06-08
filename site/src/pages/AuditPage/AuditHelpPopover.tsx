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

export const AuditHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger />

			<HelpPopoverContent>
				<HelpPopoverTitle>什么是审计日志？</HelpPopoverTitle>
				<HelpPopoverText>
					审计日志是记录整个系统中发生的事件和更改的记录。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/admin/security/audit-logs")}>
						我们追踪的事件
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
