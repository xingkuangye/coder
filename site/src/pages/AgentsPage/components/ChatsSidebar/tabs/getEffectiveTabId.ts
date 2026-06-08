/**
 * 根据可用的选项卡 ID 集合、当前存储的选择以及桌面聊天选项卡是否可用，确定哪个侧边栏选项卡应该处于活动状态。
 */
export function getEffectiveTabId(
	tabIds: readonly string[],
	activeTabId: string | null,
	desktopChatId: string | undefined,
): string | null {
	const allIds = new Set(tabIds);
	if (desktopChatId) {
		allIds.add("desktop");
	}

	if (activeTabId !== null && allIds.has(activeTabId)) {
		return activeTabId;
	}

	return tabIds[0] ?? (desktopChatId ? "desktop" : null);
}
