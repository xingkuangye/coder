import { CONCRETE_THEMES, type ConcreteThemeName } from "#/theme";

type ThemeCopy = {
	title: string;
	description: string;
};

export const THEME_COPY: Record<ConcreteThemeName, ThemeCopy> = {
	light: {
		title: "浅色默认",
		description:
			"Coder 的标准浅色主题，具有完整的色彩对比度和亮度。",
	},
	"light-protan-deuter": {
		title: "浅色红色盲/绿色盲",
		description:
			"适用于难以区分红色和绿色的人群。",
	},
	"light-tritan": {
		title: "浅色蓝黄色盲",
		description:
			"适用于难以区分蓝色和绿色，以及黄色和紫色的人群。",
	},
	dark: {
		title: "深色默认",
		description:
			"Coder 的标准深色主题，在深色背景上具有完整的色彩对比度和亮度。",
	},
	"dark-protan-deuter": {
		title: "深色红色盲/绿色盲",
		description:
			"适用于难以区分红色和绿色的人群，采用深色背景。",
	},
	"dark-tritan": {
		title: "深色蓝黄色盲",
		description:
			"适用于难以区分蓝色和绿色，以及黄色和紫色的人群，采用深色背景。",
	},
};

export const LIGHT_THEMES: ConcreteThemeName[] = [
	"light",
	"light-protan-deuter",
	"light-tritan",
];

export const DARK_THEMES: ConcreteThemeName[] = [
	"dark",
	"dark-protan-deuter",
	"dark-tritan",
];

export const SYNC_MODE_THEMES: ConcreteThemeName[] = [
	...LIGHT_THEMES,
	...DARK_THEMES,
];

const syncModeThemes = SYNC_MODE_THEMES;
const themeCopyKeys = Object.keys(THEME_COPY);
if (
	syncModeThemes.length !== CONCRETE_THEMES.length ||
	themeCopyKeys.length !== CONCRETE_THEMES.length ||
	!CONCRETE_THEMES.every((theme) => syncModeThemes.includes(theme))
) {
	throw new Error(
		"主题副本注册表与 CONCRETE_THEMES 不同步。",
	);
}
