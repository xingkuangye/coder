import { ArrowUpRightIcon } from "lucide-react";
import type { FC } from "react";
import type { BuildInfoResponse, Experiment } from "#/api/typesGenerated";
import {
	Sidebar as BaseSidebar,
	SettingsSidebarNavItem as SidebarNavItem,
} from "#/components/Sidebar/Sidebar";
import type { Permissions } from "#/modules/permissions";
import { getPrereleaseFlag } from "#/utils/buildInfo";

interface DeploymentSidebarViewProps {
	/** Site-wide permissions. */
	permissions: Permissions;
	showOrganizations: boolean;
	hasPremiumLicense: boolean;
	experiments: Experiment[];
	buildInfo: BuildInfoResponse;
}

/**
 * Displays navigation for deployment settings.  If active, highlight the main
 * menu heading.
 */
export const DeploymentSidebarView: FC<DeploymentSidebarViewProps> = ({
	permissions,
	showOrganizations,
	hasPremiumLicense,
	experiments,
	buildInfo,
}) => {
	return (
		<BaseSidebar>
			<div className="flex flex-col gap-1">
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/overview">概览</SidebarNavItem>
				)}
				{permissions.viewAllLicenses && (
					<SidebarNavItem href="/deployment/licenses">许可证</SidebarNavItem>
				)}
				{permissions.editDeploymentConfig && (
					<SidebarNavItem href="/deployment/appearance">
						外观
					</SidebarNavItem>
				)}
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/userauth">
						用户认证
					</SidebarNavItem>
				)}
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/external-auth">
						外部认证
					</SidebarNavItem>
				)}
				{permissions.viewDeploymentConfig &&
					(experiments.includes("oauth2") ||
						getPrereleaseFlag(buildInfo) === "devel") && (
						<SidebarNavItem href="/deployment/oauth2-provider/apps">
							OAuth2 应用程序
						</SidebarNavItem>
					)}
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/network">网络</SidebarNavItem>
				)}
				{permissions.readWorkspaceProxies && (
					<SidebarNavItem href="/deployment/workspace-proxies">
						工作区代理
					</SidebarNavItem>
				)}
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/security">安全</SidebarNavItem>
				)}
				{permissions.viewDeploymentConfig && (
					<SidebarNavItem href="/deployment/observability">
						可观测性
					</SidebarNavItem>
				)}

				{permissions.viewAllUsers && (
					<SidebarNavItem href="/deployment/users">用户</SidebarNavItem>
				)}
				{permissions.viewAnyGroup && (
					<SidebarNavItem href="/deployment/groups">
						<div className="flex flex-row items-center gap-1">
							组 {showOrganizations && <ArrowUpRightIcon size={16} />}
						</div>
					</SidebarNavItem>
				)}
				{permissions.viewOrganizationIDPSyncSettings && (
					<SidebarNavItem href="/deployment/idp-org-sync">
						IdP 组织同步
					</SidebarNavItem>
				)}
				{permissions.viewNotificationTemplate && (
					<SidebarNavItem href="/deployment/notifications">
						<div className="flex flex-row items-center gap-2">
							<span>通知</span>
						</div>
					</SidebarNavItem>
				)}
				{!hasPremiumLicense && (
					<SidebarNavItem href="/deployment/premium">高级版</SidebarNavItem>
				)}
			</div>
		</BaseSidebar>
	);
};
