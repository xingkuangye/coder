import { ArrowUpRightIcon } from "lucide-react";
import type { FC } from "react";
import {
	Sidebar as BaseSidebar,
	SettingsSidebarNavItem as SidebarNavItem,
} from "#/components/Sidebar/Sidebar";
import type { Permissions } from "#/modules/permissions";

interface AISettingsSidebarViewProps {
	/** Site-wide permissions. */
	permissions: Permissions;
}

const AISettingsSidebarView: FC<AISettingsSidebarViewProps> = ({
	permissions,
}) => {
	return (
		<BaseSidebar>
			<div className="flex flex-col gap-1">
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/ai/settings/governance">
						AI 治理
					</SidebarNavItem>
				)}
				<SidebarNavItem href="/ai/settings" end>
					提供者
				</SidebarNavItem>
				{permissions.editDeploymentConfig && (
					<SidebarNavItem href="/agents/settings/agents">
						<div className="flex flex-row items-center gap-1">
							管理 Coder 代理 <ArrowUpRightIcon size={16} />
						</div>
					</SidebarNavItem>
				)}
			</div>
		</BaseSidebar>
	);
};

export default AISettingsSidebarView;
