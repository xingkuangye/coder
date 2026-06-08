import { ChevronDownIcon as LucideChevronDown } from "lucide-react";
import { cn } from "#/utils/cn";

interface ChevronDownIconProps
	extends React.ComponentProps<typeof LucideChevronDown> {
	/**
	 * 显式控制旋转状态。当省略时，旋转由带有 className="group" 的父元素上的 Radix data-state 属性驱动。
	 */
	open?: boolean;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
	open,
	className,
	...props
}) => (
	<LucideChevronDown
		className={cn(
			"transition-transform",
			open !== undefined
				? open && "rotate-180"
				: "group-data-[state=open]:rotate-180",
			className,
		)}
		{...props}
	/>
);
