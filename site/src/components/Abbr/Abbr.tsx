import type { FC, HTMLAttributes } from "react";
import { cn } from "#/utils/cn";

type Pronunciation = "shorthand" | "acronym" | "initialism";

type AbbrProps = HTMLAttributes<HTMLElement> & {
	children: string;
	title: string;
	pronunciation?: Pronunciation;
	className?: string;
};

/**
 * 一个比原生 <abbr> 元素更复杂的版本。
 *
 * 特性：
 * - 更好的类型安全（要求你包含某些属性）
 * - 默认会剥离所有内置 HTML 样式
 * - 更好地与屏幕阅读器集成（例如向它们暴露 title 属性），并提供更多选项来影响文本的发音方式
 */
export const Abbr: FC<AbbrProps> = ({
	children,
	title,
	pronunciation = "shorthand",
	className,
	...delegatedProps
}) => {
	return (
		<abbr
			// Adding title to make things a little easier for sighted users,
			// but titles aren't always exposed via screen readers. Still have
			// to inject the actual text content inside the abbr itself
			title={title}
			className={cn(
				"no-underline tracking-normal",
				children === children.toUpperCase() && "tracking-wide",
				className,
			)}
			{...delegatedProps}
		>
			<span aria-hidden>{children}</span>
			<span className="sr-only">
				{getAccessibleLabel(children, title, pronunciation)}
			</span>
		</abbr>
	);
};

function getAccessibleLabel(
	abbreviation: string,
	title: string,
	pronunciation: Pronunciation,
): string {
	if (pronunciation === "initialism") {
		return `${initializeText(abbreviation)} (${title})`;
	}

	if (pronunciation === "acronym") {
		return `${flattenPronunciation(abbreviation)} (${title})`;
	}

	return title;
}

function initializeText(text: string): string {
	return `${text.trim().toUpperCase().replaceAll(/\B/g, ".")}.`;
}

function flattenPronunciation(text: string): string {
	const trimmed = text.trim();
	return (trimmed[0] ?? "").toUpperCase() + trimmed.slice(1).toLowerCase();
}
