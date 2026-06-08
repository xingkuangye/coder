/**
 * @deprecated MUI 主题已弃用。迁移到 Tailwind CSS 主题系统。
 *
 * 重新导出基础的亮色 MUI 主题，确保 `palette.mode === "light"` 在旧版
 * MUI 组件中保持正确。色盲调色板的覆盖配置位于 `roles.ts` 和
 * `site/src/index.css` 中的 CSS 变量块内。
 */
export { default } from "../light/mui";
