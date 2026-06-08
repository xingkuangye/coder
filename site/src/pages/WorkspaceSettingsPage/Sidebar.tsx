import {
	SettingsIcon as GeneralIcon,
	CodeIcon as ParameterIcon,
	TimerIcon as ScheduleIcon,
	UsersIcon as SharingIcon,
} from "lucide-react";
import { Avatar } from "#/components/Avatar/Avatar";
import {
	Sidebar as BaseSidebar,
	SidebarHeader,
	SidebarNavItem,
} from "#/components/Sidebar/Sidebar";
import { useWorkspaceSettings } from "./useWorkspaceSettings";

export const Sidebar: React.FC = () => {
	const { owner, workspace, permissions } = useWorkspaceSettings();

	return (
		<BaseSidebar>
			<SidebarHeader
				avatar={
					<Avatar
						variant="icon"
						src={workspace.template_icon}
						fallback={workspace.name}
					/>
				}
				title={workspace.name}
				linkTo={`/@${owner}/${workspace.name}`}
				subtitle={workspace.template_display_name ?? workspace.template_name}
			/>

			<SidebarNavItem href="" icon={GeneralIcon}>
				通用
			</SidebarNavItem>
			<SidebarNavItem href="parameters" icon={ParameterIcon}>
				参数
			</SidebarNavItem>
			<SidebarNavItem href="schedule" icon={ScheduleIcon}>
				计划
			</SidebarNavItem>
			{permissions?.shareWorkspace && (
				<SidebarNavItem href="sharing" icon={SharingIcon}>
					分享
				</SidebarNavItem>
			)}
		</BaseSidebar>
	);
};
