import { useEffect } from "react";

/**
 * 在智能体页面挂载时注入 PWA 相关的 <head> 标签
 * （manifest、apple-touch-icon、mobile-web-app 元数据）并调整
 * viewport 以防止缩放。卸载时清理所有内容。
 */
export function useAgentsPWA() {
	useEffect(() => {
		// -- Injected elements --------------------------------------------------
		const manifest = document.createElement("link");
		manifest.rel = "manifest";
		manifest.href = "/manifest.json";

		const appleTouchIcon = document.createElement("link");
		appleTouchIcon.rel = "apple-touch-icon";
		appleTouchIcon.href = "/apple-touch-icon.png";

		const mobileWebAppCapable = document.createElement("meta");
		mobileWebAppCapable.name = "mobile-web-app-capable";
		mobileWebAppCapable.content = "yes";

		const appleMobileWebAppCapable = document.createElement("meta");
		appleMobileWebAppCapable.name = "apple-mobile-web-app-capable";
		appleMobileWebAppCapable.content = "yes";

		const appleMobileWebAppStatusBarStyle = document.createElement("meta");
		appleMobileWebAppStatusBarStyle.name =
			"apple-mobile-web-app-status-bar-style";
		appleMobileWebAppStatusBarStyle.content = "black-translucent";

		const appleMobileWebAppTitle = document.createElement("meta");
		appleMobileWebAppTitle.name = "apple-mobile-web-app-title";
		appleMobileWebAppTitle.content = "智能体";

		const injected = [
			manifest,
			appleTouchIcon,
			mobileWebAppCapable,
			appleMobileWebAppCapable,
			appleMobileWebAppStatusBarStyle,
			appleMobileWebAppTitle,
		];

		for (const el of injected) {
			document.head.appendChild(el);
		}

		// -- Viewport override --------------------------------------------------
		const viewport = document.querySelector<HTMLMetaElement>(
			'meta[name="viewport"]',
		);
		const prevViewportContent = viewport?.content ?? "";

		if (viewport) {
			viewport.content =
				"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
		}

		// -- Cleanup ------------------------------------------------------------
		return () => {
			for (const el of injected) {
				el.remove();
			}
			if (viewport) {
				viewport.content = prevViewportContent;
			}
		};
	}, []);
}
