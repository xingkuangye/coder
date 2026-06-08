/**
 * 改编自 `DropdownMenu.tsx`，包装了 Radix 的 ContextMenu 原语。
 * 通过 `menuClasses.ts` 与 DropdownMenu 共享菜单样式，确保单击触发和右键触发的菜单在构造上保持视觉同步。
 * @see {@link https://www.radix-ui.com/primitives/docs/components/context-menu}
 */
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { cn } from "#/utils/cn";
import {
	menuContentClass,
	menuItemClass,
	menuSeparatorClass,
} from "../DropdownMenu/menuClasses";

export const ContextMenu = ContextMenuPrimitive.Root;

export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

/** @public */
export const ContextMenuGroup = ContextMenuPrimitive.Group;

/** @public */
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

export const ContextMenuContent: React.FC<
	React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Content>
> = ({ className, ...props }) => {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				className={cn(menuContentClass, className)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
};

type ContextMenuItemProps = React.ComponentPropsWithRef<
	typeof ContextMenuPrimitive.Item
> & {
	inset?: boolean;
};

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
	className,
	inset,
	...props
}) => {
	return (
		<ContextMenuPrimitive.Item
			className={cn(menuItemClass, inset && "pl-8", className)}
			{...props}
		/>
	);
};

export const ContextMenuSeparator: React.FC<
	React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Separator>
> = ({ className, ...props }) => {
	return (
		<ContextMenuPrimitive.Separator
			className={cn([menuSeparatorClass], className)}
			{...props}
		/>
	);
};
