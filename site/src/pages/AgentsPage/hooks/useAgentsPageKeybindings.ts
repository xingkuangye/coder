import { useEffect } from "react";
import { isMac } from "#/utils/platform";

/**
 * Agents 页面的全局键盘快捷键。
 *
 * - Ctrl+N / Cmd+N：创建新的代理。
 * - Ctrl+K / Cmd+K：切换代理搜索。
 */
export function useAgentsPageKeybindings({
	onNewAgent,
	onToggleSearch,
}: {
	onNewAgent: () => void;
	onToggleSearch?: () => void;
}) {
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const isModifierPressed = isMac() ? event.metaKey : event.ctrlKey;
			if (!isModifierPressed || event.altKey || event.shiftKey) {
				return;
			}

			const key = event.key.toLowerCase();
			if (key === "n") {
				event.preventDefault();
				onNewAgent();
				return;
			}

			if (key === "k" && onToggleSearch) {
				event.preventDefault();
				onToggleSearch();
			}
		};

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onNewAgent, onToggleSearch]);
}
