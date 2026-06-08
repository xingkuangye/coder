/**
 * 判断当前平台是否是 macOS，是则返回 true。
 */
export function isMac(): boolean {
	return Boolean(navigator.platform.match("Mac"));
}

/**
 * 返回适合当前平台的修饰键标签：在 macOS 上为 ⌘，其他平台为 Ctrl。
 */
export function getOSKey(): string {
	return isMac() ? "⌘" : "Ctrl";
}
