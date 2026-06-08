/**
 * 当视口宽度小于或等于 `sm` Tailwind 断点（< 640 px）时返回 `true`，
 * 这可以合理地代理移动 / 触屏设备，在这些设备上自动聚焦输入框会意外
 * 弹出虚拟键盘。
 */
export const isMobileViewport = (): boolean => {
	return window.matchMedia("(max-width: 639px)").matches;
};

export const belowMdViewportMediaQuery = "(max-width: 767px)";

/**
 * 当视口宽度低于 `md` Tailwind 断点（< 768 px）时返回 `true`。
 * 用它来进行需要与 `md:` Tailwind 工具类对齐的布局分支（例如移动端
 * 全宽下拉 / 内联菜单布局），这样 640 到 767 px 之间的视口（常见的
 * 横屏手机和小平板）会选择移动端分支，而不是桌面端弹出分支。
 */
export const isBelowMdViewport = (): boolean => {
	return window.matchMedia(belowMdViewportMediaQuery).matches;
};
