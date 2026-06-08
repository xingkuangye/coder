import type { CSSProperties } from "react";

export interface ExternalImageModeStyles {
	/**
	 * 单色图标将被扁平化为中性且适合主题的颜色。
	 * 例如：白色、浅灰色、深灰色、黑色
	 */
	monochrome?: CSSProperties;
	/**
	 * @default
	 * 全色图标在任何背景下都能呈现最佳效果，具有鲜明的色彩和良好的对比度。这是默认模式，不会改变图标。
	 */
	fullcolor?: CSSProperties;
	/**
	 * whiteWithColor 适用于主要颜色为白色或包含白色文字的图标，这些图标在浅色背景下难以看清或显示不正确。此设置将应用一种尊重颜色的反转滤镜，在适当的时候将白色变为黑色以改善对比度。
	 * 如果图标仍不完全正确，你也可以指定 `brightness` 级别。
	 * 例如：/icon/aws.svg?blackWithColor&brightness=1.5
	 */
	whiteWithColor?: CSSProperties;
	/**
	 * blackWithColor 适用于主要颜色为黑色或包含黑色文字的图标，这些图标在深色背景下难以看清或显示不正确。此设置将应用一种尊重颜色的反转滤镜，在适当的时候将黑色变为白色以改善对比度。
	 * 如果图标仍不完全正确，你也可以指定 `brightness` 级别。
	 * 例如：/icon/aws.svg?blackWithColor&brightness=1.5
	 */
	blackWithColor?: CSSProperties;
}

export const forDarkThemes: ExternalImageModeStyles = {
	// brighten icons a little to make sure they have good contrast with the background
	monochrome: { filter: "grayscale(100%) contrast(0%) brightness(250%)" },
	// do nothing to full-color icons
	fullcolor: undefined,
	// white on a dark background ✅
	whiteWithColor: undefined,
	// black on a dark background 🆘: invert, and then correct colors
	blackWithColor: { filter: "invert(1) hue-rotate(180deg)" },
};

export const forLightThemes: ExternalImageModeStyles = {
	// darken icons a little to make sure they have good contrast with the background
	monochrome: { filter: "grayscale(100%) contrast(0%) brightness(70%)" },
	// do nothing to full-color icons
	fullcolor: undefined,
	// black on a dark background 🆘: invert, and then correct colors
	whiteWithColor: { filter: "invert(1) hue-rotate(180deg)" },
	// black on a light background ✅
	blackWithColor: undefined,
};

// multiplier matches the beginning of the string (^), a number, optionally followed
// followed by a decimal portion, optionally followed by a percent symbol, and the
// end of the string ($).
const multiplier = /^\d+(\.\d+)?%?$/;

/**
 * 与 `whiteWithColor` 和 `blackWithColor` 一起使用，以便进行更精细的调整
 */
const parseInvertFilterParameters = (
	params: URLSearchParams,
	baseStyles?: CSSProperties,
) => {
	// Only apply additional styles if the current theme supports this mode
	if (!baseStyles) {
		return;
	}

	let extraStyles: CSSProperties | undefined;

	const brightness = params.get("brightness") ?? "";
	if (multiplier.test(brightness)) {
		let filter = baseStyles.filter ?? "";
		filter += ` brightness(${brightness})`;
		extraStyles = { ...extraStyles, filter };
	}

	if (!extraStyles) {
		return baseStyles;
	}

	return {
		...baseStyles,
		...extraStyles,
	};
};

export function parseImageParameters(
	modes: ExternalImageModeStyles,
	searchString: string,
): CSSProperties | undefined {
	const params = new URLSearchParams(searchString);

	let styles: CSSProperties | undefined = modes.fullcolor;

	if (params.has("monochrome")) {
		styles = modes.monochrome;
	} else if (params.has("whiteWithColor")) {
		styles = parseInvertFilterParameters(params, modes.whiteWithColor);
	} else if (params.has("blackWithColor")) {
		styles = parseInvertFilterParameters(params, modes.blackWithColor);
	}

	return styles;
}

export function getExternalImageStylesFromUrl(
	modes: ExternalImageModeStyles,
	urlString?: string,
) {
	if (!urlString) {
		return undefined;
	}

	const url = new URL(urlString, location.origin);

	if (url.search) {
		return parseImageParameters(modes, url.search);
	}

	if (
		url.origin === location.origin &&
		defaultParametersForBuiltinIcons.has(url.pathname)
	) {
		return parseImageParameters(
			modes,
			defaultParametersForBuiltinIcons.get(url.pathname) as string,
		);
	}

	return undefined;
}

/**
 * defaultParametersForBuiltinIcons 包含了所有内置图标的模式，这些图标在默认全色模式下并非在所有主题中都具有最佳外观。
 */
export const defaultParametersForBuiltinIcons = new Map<string, string>([
	["/icon/apple-black.svg", "monochrome"],
	["/icon/auggie.svg", "monochrome"],
	["/icon/anthropic.svg", "monochrome"],
	["/icon/auto-dev-server.svg", "monochrome"],
	["/icon/aws-monochrome.svg", "monochrome"],
	["/icon/aws.png", "whiteWithColor&brightness=1.5"],
	["/icon/aws.svg", "whiteWithColor&brightness=1.5"],
	["/icon/coder.svg", "monochrome"],
	["/icon/container.svg", "monochrome"],
	["/icon/copyparty.svg", "blackWithColor"],
	["/icon/database.svg", "monochrome"],
	["/icon/devcontainers.svg", "monochrome"],
	["/icon/docker-white.svg", "monochrome"],
	["/icon/folder.svg", "monochrome"],
	["/icon/gemini-monochrome.svg", "monochrome"],
	["/icon/github-copilot.svg", "whiteWithColor"],
	["/icon/github.svg", "monochrome"],
	["/icon/image.svg", "monochrome"],
	["/icon/jupyter.svg", "blackWithColor"],
	["/icon/kasmvnc.svg", "whiteWithColor"],
	["/icon/kilo-code.svg", "blackWithColor"],
	["/icon/kiro.svg", "whiteWithColor"],
	["/icon/memory.svg", "monochrome"],
	["/icon/mux.svg", "monochrome"],
	["/icon/nexus-repository.svg", "blackWithColor"],
	["/icon/okta.svg", "monochrome"],
	["/icon/openai-codex.svg", "monochrome"],
	["/icon/openai.svg", "monochrome"],
	["/icon/openwebui.svg", "monochrome"],
	["/icon/perplexica.svg", "monochrome"],
	["/icon/roo-code.svg", "whiteWithColor"],
	["/icon/rust.svg", "monochrome"],
	["/icon/tasks.svg", "monochrome"],
	["/icon/terminal.svg", "monochrome"],
	["/icon/vercel.svg", "whiteWithColor"],
	["/icon/widgets.svg", "monochrome"],
	["/icon/windsurf.svg", "monochrome"],
	["/icon/zed.svg", "monochrome"],
]);
