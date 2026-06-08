/**
 * @file 2024-02-19 - MES - 遗憾的是，尽管这个 hook 旨在使元素更易访问，
 * 但目前它却起到了相反的作用。根据 axe 审计，当前实现会产生一系列
 * 严重级别的可访问性违规：
 *
 * 1. 嵌套交互元素（例如，工作区表格行内包含复选框
 *    的情况）
 * 2. 覆盖原生元素的角色（在此情况下，将原生表格行转换为按钮，
 *    这意味着屏幕阅读器失去了将行数据作为更大表格一部分
 *    进行播报的能力）
 *
 * 在底层的设计问题得到修复之前，测试这个 hook
 * 可能没有意义。
 */
import type { HTMLAttributes, MouseEventHandler } from "react";
import { cn } from "#/utils/cn";
import {
	type ClickableAriaRole,
	type UseClickableResult,
	useClickable,
} from "./useClickable";

type TableRowClickHandlers = Pick<
	HTMLAttributes<HTMLTableRowElement>,
	"onClick" | "onDoubleClick" | "onAuxClick"
>;

type UseClickableTableRowResult<
	TRole extends ClickableAriaRole = ClickableAriaRole,
> = UseClickableResult<HTMLTableRowElement, TRole> &
	TableRowClickHandlers & {
		className: string;
		hover: true;
		onAuxClick: MouseEventHandler<HTMLTableRowElement>;
	};

type UseClickableTableRowConfig<TRole extends ClickableAriaRole> =
	TableRowClickHandlers & {
		role?: TRole;
		onClick: MouseEventHandler<HTMLTableRowElement>;
		onMiddleClick?: MouseEventHandler<HTMLTableRowElement>;
	};

export const useClickableTableRow = <
	TRole extends ClickableAriaRole = ClickableAriaRole,
>({
	role,
	onClick,
	onDoubleClick,
	onMiddleClick,
	onAuxClick: externalOnAuxClick,
}: UseClickableTableRowConfig<TRole>): UseClickableTableRowResult<TRole> => {
	const clickableProps = useClickable(onClick, (role ?? "button") as TRole);

	return {
		...clickableProps,
		className: cn([
			"cursor-pointer hover:outline focus-visible:outline outline-1 -outline-offset-1 outline-border-secondary",
			"first:rounded-t-md last:rounded-b-md",
		]),
		hover: true,
		onDoubleClick,
		onAuxClick: (event) => {
			// Regardless of which callback gets called, the hook won't stop the event
			// from bubbling further up the DOM
			const isMiddleMouseButton = event.button === 1;
			if (isMiddleMouseButton) {
				onMiddleClick?.(event);
			} else {
				externalOnAuxClick?.(event);
			}
		},
	};
};
