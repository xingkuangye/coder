import type { FC } from "react";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import AISettingsSidebarView from "#/modules/management/AISettingsSidebarView";

/**
 * AI 设置侧边栏。
 */
export const AISettingsSidebar: FC = () => {
	const { permissions } = useAuthenticated();
	return <AISettingsSidebarView permissions={permissions} />;
};
