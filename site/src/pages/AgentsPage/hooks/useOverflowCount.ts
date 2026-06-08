import { type RefObject, useLayoutEffect, useState } from "react";

/**
 * 观察一个 flex 容器，其子元素布局如下：
 *
 *   [item₀] [item₁] … [itemₙ₋₁] [pill]
 *
 * 并报告前 `itemCount` 个子元素中有多少超出了容器的可见宽度。
 * 当容器大小改变或子元素变化时，计数会自动更新。
 *
 * 调用方应始终将 "+N" 标记作为最后一个子元素渲染
 * （当计数为 0 时使用 `visibility: hidden`），以便其布局空间始终被保留。
 * 此 hook 从 DOM 中读取标记的实际渲染宽度和容器的 CSS `gap`，
 * 因此没有硬编码的尺寸假设。
 */
export function useOverflowCount(
	containerRef: RefObject<HTMLElement | null>,
	itemCount: number,
): number {
	const [overflowCount, setOverflowCount] = useState(0);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const measure = () => {
			const children = container.children;
			const count = Math.min(itemCount, children.length);
			if (count === 0) {
				setOverflowCount(0);
				return;
			}

			const containerRight = container.getBoundingClientRect().right;

			// First pass: check if all items fit at full width.
			// If so, no pill needed and we're done.
			// +1px tolerance for subpixel rounding in getBoundingClientRect.
			let allFit = true;
			for (let i = 0; i < count; i++) {
				if (children[i].getBoundingClientRect().right > containerRight + 1) {
					allFit = false;
					break;
				}
			}

			if (allFit) {
				setOverflowCount(0);
				return;
			}

			// Something genuinely overflows. Reserve space for the
			// pill (last child) so it won't be clipped. Read its
			// width and the container gap from the DOM rather than
			// hardcoding values that break under font scaling or
			// double-digit overflow counts.
			const pill = children[children.length - 1];
			const pillWidth = pill ? pill.getBoundingClientRect().width : 0;
			const gap = Number.parseFloat(
				getComputedStyle(container).columnGap || "0",
			);
			const effectiveRight = containerRight - pillWidth - gap;

			// +1px tolerance for subpixel rounding in getBoundingClientRect.
			let hidden = 0;
			for (let i = 0; i < count; i++) {
				if (children[i].getBoundingClientRect().right > effectiveRight + 1) {
					hidden++;
				}
			}

			setOverflowCount(Math.max(hidden, 1));
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(container);

		const mo = new MutationObserver(measure);
		mo.observe(container, { childList: true });

		return () => {
			ro.disconnect();
			mo.disconnect();
		};
	}, [containerRef, itemCount]);

	return overflowCount;
}
