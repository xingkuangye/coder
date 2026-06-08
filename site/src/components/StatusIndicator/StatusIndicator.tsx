import { cva, type VariantProps } from "class-variance-authority";
import { createContext, type FC, useContext } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { cn } from "#/utils/cn";

const statusIndicatorVariants = cva(
	"font-medium inline-flex items-center gap-2",
	{
		variants: {
			variant: {
				success: "text-content-success",
				failed: "text-content-destructive",
				inactive: "text-content-secondary",
				warning: "text-content-warning",
				pending: "text-highlight-sky",
			},
			size: {
				sm: "text-xs",
				md: "text-sm",
			},
		},
		defaultVariants: {
			variant: "success",
			size: "md",
		},
	},
);

type StatusIndicatorContextValue = VariantProps<typeof statusIndicatorVariants>;

const StatusIndicatorContext = createContext<StatusIndicatorContextValue>({});

export type StatusIndicatorProps = React.ComponentPropsWithRef<"div"> &
	StatusIndicatorContextValue;

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
	size,
	variant,
	className,
	...props
}) => {
	return (
		<StatusIndicatorContext.Provider value={{ size, variant }}>
			<div
				className={cn(statusIndicatorVariants({ variant, size }), className)}
				{...props}
			/>
		</StatusIndicatorContext.Provider>
	);
};

const dotVariants = cva("rounded-full inline-block border-4 border-solid", {
	variants: {
		variant: {
			success: "bg-content-success border-surface-green",
			failed: "bg-content-destructive border-surface-destructive",
			inactive: "bg-content-secondary border-surface-grey",
			warning: "bg-content-warning border-surface-orange",
			pending: "bg-highlight-sky border-surface-sky",
		},
		size: {
			sm: "size-3 border-4",
			md: "size-4 border-4",
		},
	},
	defaultVariants: {
		variant: "success",
		size: "md",
	},
});

export interface StatusIndicatorDotProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof dotVariants> {}

export const StatusIndicatorDot: FC<StatusIndicatorDotProps> = ({
	className,
	// We allow the size and variant to be overridden directly by the component.
	// This allows StatusIndicatorDot to be used alone.
	size,
	variant,
	...props
}) => {
	const { size: ctxSize, variant: ctxVariant } = useContext(
		StatusIndicatorContext,
	);

	return (
		<div
			className={cn(
				dotVariants({ variant: variant ?? ctxVariant, size: size ?? ctxSize }),
				className,
			)}
			{...props}
		/>
	);
};

interface StatusHealthyIndicatorProps {
	derpOnly?: boolean;
}

export const StatusHealthyIndicator: FC<StatusHealthyIndicatorProps> = ({
	derpOnly,
}: StatusHealthyIndicatorProps) => {
	return (
		<StatusIndicator variant="success">
			<StatusIndicatorDot />
			{derpOnly ? "健康 (仅 DERP)" : "健康"}
		</StatusIndicator>
	);
};

export const StatusNotHealthyIndicator: FC = () => {
	return (
		<StatusIndicator variant="failed">
			<StatusIndicatorDot />
			异常
		</StatusIndicator>
	);
};

export const StatusNotRegisteredIndicator: FC = () => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<StatusIndicator variant="warning">
					<StatusIndicatorDot />
					从未出现
				</StatusIndicator>
			</TooltipTrigger>
			<TooltipContent>
				工作区代理从未上线，需要启动。
			</TooltipContent>
		</Tooltip>
	);
};

export const StatusNotReachableIndicator: FC = () => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<StatusIndicator variant="warning">
					<StatusIndicatorDot />
					无法访问
				</StatusIndicator>
			</TooltipTrigger>
			<TooltipContent>
				工作区代理未响应 http(s) 请求。
			</TooltipContent>
		</Tooltip>
	);
};
