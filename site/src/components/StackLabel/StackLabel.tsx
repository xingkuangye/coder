import type { ComponentProps, FC } from "react";
import { cn } from "#/utils/cn";

/**
 * 在实现单选按钮、复选框或开关时，请将这些组件用作 FormControlLabel 内的标签，以确保样式正确。
 */

export const StackLabel: FC<ComponentProps<"div">> = ({
	className,
	...props
}) => {
	return (
		<div
			className={cn("flex flex-col gap-1 pl-3 font-medium", className)}
			{...props}
		/>
	);
};

export const StackLabelHelperText: FC<ComponentProps<"p">> = ({
	className,
	...props
}) => {
	return (
		<p
			className={cn(
				"mt-0 text-xs text-content-secondary leading-[1.66] [&_strong]:text-content-primary",
				className,
			)}
			{...props}
		/>
	);
};
