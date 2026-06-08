/**
 * Copied from shadc/ui on 11/13/2024
 * @see {@link https://ui.shadcn.com/docs/components/dialog}
 */
import { cva, type VariantProps } from "class-variance-authority";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import { cn } from "#/utils/cn";

export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

export const DialogClose = DialogPrimitive.Close;

const DialogOverlay: React.FC<
	React.ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
> = ({ className, ...props }) => {
	return (
		<DialogPrimitive.Overlay
			className={cn(
				`fixed inset-0 z-50 bg-overlay
			data-[state=open]:animate-in data-[state=closed]:animate-out
			data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`,
				className,
			)}
			{...props}
		/>
	);
};

const dialogVariants = cva(
	`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg gap-6
	border border-solid bg-surface-primary p-8 shadow-lg duration-200 sm:rounded-lg
	translate-x-[-50%] translate-y-[-50%] outline-none
	data-[state=open]:animate-in data-[state=closed]:animate-out
	data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
	data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
	data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
	data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]`,
	{
		variants: {
			variant: {
				default: "border-border-primary",
				destructive: "border-border-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type DialogContentProps = React.ComponentPropsWithRef<
	typeof DialogPrimitive.Content
> &
	VariantProps<typeof dialogVariants>;

export const DialogContent: React.FC<DialogContentProps> = ({
	className,
	variant,
	children,
	...props
}) => {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={cn(dialogVariants({ variant }), className)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
};

export const DialogHeader: React.FC<React.ComponentPropsWithRef<"div">> = ({
	className,
	...props
}) => {
	return (
		<div
			className={cn(
				"flex flex-col space-y-5 text-center sm:text-left",
				className,
			)}
			{...props}
		/>
	);
};

export const DialogFooter: React.FC<React.ComponentPropsWithRef<"div">> = ({
	className,
	...props
}) => {
	return (
		<div
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	);
};

type DialogActionsProps = {
	/** 确认按钮中显示的文本 */
	confirmText?: React.ReactNode;
	/** 确认按钮是否正在加载，为 true 时也会禁用取消按钮 */
	confirmLoading?: boolean;
	/** 提交按钮是否被禁用 */
	confirmDisabled?: boolean;
	/** 确认按钮是否触发破坏性操作 */
	confirmVariant?: React.ComponentProps<typeof Button>["variant"];
	/** 点击确认按钮时调用 */
	onConfirm?: () => void;

	/** 取消按钮中显示的文本 */
	cancelText?: string;
	/** 点击取消按钮时调用 */
	onCancel?: () => void;
};

/**
 * 快速处理大多数模态框操作，通常是取消和确认按钮的组合
 */
export const DialogActions: React.FC<DialogActionsProps> = ({
	confirmText = "确认",
	confirmLoading = false,
	confirmDisabled = false,
	confirmVariant,
	onConfirm,

	cancelText = "取消",
	onCancel,
}) => {
	return (
		<>
			{onCancel && (
				<Button
					disabled={confirmLoading}
					onClick={(e) => {
						e.stopPropagation();
						onCancel();
					}}
					variant="outline"
				>
					{cancelText}
				</Button>
			)}

			{onConfirm && (
				<Button
					variant={confirmVariant}
					disabled={confirmLoading || confirmDisabled}
					onClick={onConfirm}
					data-testid="confirm-button"
					type="submit"
				>
					<Spinner loading={confirmLoading} />
					{confirmText}
				</Button>
			)}
		</>
	);
};

export const DialogTitle: React.FC<
	React.ComponentPropsWithRef<typeof DialogPrimitive.Title>
> = ({ className, ...props }) => {
	return (
		<DialogPrimitive.Title
			className={cn(
				"text-xl m-0 text-content-primary font-semibold leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	);
};

export const DialogDescription: React.FC<
	React.ComponentPropsWithRef<typeof DialogPrimitive.Description>
> = ({ className, ...props }) => {
	return (
		<DialogPrimitive.Description
			className={cn("text-sm text-content-secondary font-medium", className)}
			{...props}
		/>
	);
};
