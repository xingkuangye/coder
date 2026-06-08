import type { FC } from "react";
import type { User } from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import { FeatureStageBadge } from "#/components/FeatureStageBadge/FeatureStageBadge";
import {
	Sidebar as BaseSidebar,
	SettingsSidebarNavItem,
	SidebarHeader,
} from "#/components/Sidebar/Sidebar";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { getPrereleaseFlag } from "#/utils/buildInfo";

interface SidebarProps {
	user: User;
}

export const Sidebar: FC<SidebarProps> = ({ user }) => {
	const { entitlements, experiments, buildInfo } = useDashboard();
	const showSchedulePage =
		entitlements.features.advanced_template_scheduling.enabled;
	const showOAuth2Page =
		experiments.includes("oauth2") || getPrereleaseFlag(buildInfo) === "devel";

	return (
		<BaseSidebar>
			<SidebarHeader
				avatar={<Avatar fallback={user.username} src={user.avatar_url} />}
				title={user.username}
				subtitle={user.email}
			/>
			<div className="flex flex-col gap-1">
				<SettingsSidebarNavItem href="account">账户</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="appearance">
					外观
				</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="external-auth">
					外部认证
				</SettingsSidebarNavItem>
				{showOAuth2Page && (
					<SettingsSidebarNavItem href="oauth2-provider">
						OAuth2 应用
					</SettingsSidebarNavItem>
				)}
				{showSchedulePage && (
					<SettingsSidebarNavItem href="schedule">
						计划
					</SettingsSidebarNavItem>
				)}
				<SettingsSidebarNavItem href="security">
					安全
				</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="ssh-keys">
					SSH 密钥
				</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="tokens">令牌</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="secrets">
					<span className="flex min-w-0 items-center gap-2">
						<span>密钥</span>
						<FeatureStageBadge
							aria-hidden="true"
							contentType="beta"
							size="sm"
						/>
					</span>
				</SettingsSidebarNavItem>
				<SettingsSidebarNavItem href="notifications">
					通知
				</SettingsSidebarNavItem>
			</div>
		</BaseSidebar>
	);
};
