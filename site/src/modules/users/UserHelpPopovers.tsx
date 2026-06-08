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

export const RolesHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger size="small" />
			<HelpPopoverContent>
				<HelpPopoverTitle>什么是角色？</HelpPopoverTitle>
				<HelpPopoverText>
					Coder 基于角色的访问控制（RBAC）提供了精细的访问管理。查看我们的文档，了解如何使用可用的角色。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/admin/users/groups-roles")}>
						用户角色
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};

export const GroupsHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger size="small" />
			<HelpPopoverContent>
				<HelpPopoverTitle>什么是用户组？</HelpPopoverTitle>
				<HelpPopoverText>
					用户组可以与模板 RBAC 结合使用，为一组用户授予对特定模板的访问权限。查看我们的文档，了解如何使用用户组。
				</HelpPopoverText>
				<HelpPopoverLinksGroup>
					<HelpPopoverLink href={docs("/admin/users/groups-roles")}>
						用户组
					</HelpPopoverLink>
				</HelpPopoverLinksGroup>
			</HelpPopoverContent>
		</HelpPopover>
	);
};

export const AiAddonHelpPopover: FC = () => {
	return (
		<HelpPopover>
			<HelpPopoverIconTrigger size="small" />
			<HelpPopoverContent>
				<HelpPopoverTitle>什么是 AI 附加组件？</HelpPopoverTitle>
				<HelpPopoverText>
					拥有 AI 功能（如 AI Bridge 或 Tasks）访问权限且正在主动消耗席位的用户。
				</HelpPopoverText>
			</HelpPopoverContent>
		</HelpPopover>
	);
};
