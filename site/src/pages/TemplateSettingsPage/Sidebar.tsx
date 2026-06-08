import {
	LockIcon,
	TimerIcon as ScheduleIcon,
	SettingsIcon,
	CodeIcon as VariablesIcon,
} from "lucide-react";
import type { FC } from "react";
import type { Template } from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import {
	Sidebar as BaseSidebar,
	SidebarHeader,
	SidebarNavItem,
} from "#/components/Sidebar/Sidebar";
import { linkToTemplate, useLinks } from "#/modules/navigation";

interface SidebarProps {
	template: Template;
}

export const Sidebar: FC<SidebarProps> = ({ template }) => {
	const getLink = useLinks();

	return (
		<BaseSidebar>
			<SidebarHeader
				avatar={
					<Avatar variant="icon" src={template.icon} fallback={template.name} />
				}
				title={template.display_name || template.name}
				linkTo={getLink(
					linkToTemplate(template.organization_name, template.name),
				)}
				subtitle={template.name}
			/>

			<SidebarNavItem href="" icon={SettingsIcon}>
				常规
			</SidebarNavItem>
			<SidebarNavItem href="permissions" icon={LockIcon}>
				权限
			</SidebarNavItem>
			<SidebarNavItem href="variables" icon={VariablesIcon}>
				变量
			</SidebarNavItem>
			<SidebarNavItem href="schedule" icon={ScheduleIcon}>
				计划
			</SidebarNavItem>
		</BaseSidebar>
	);
};
