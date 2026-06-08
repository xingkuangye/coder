import type { FC, ReactNode } from "react";
import { Button } from "#/components/Button/Button";

type NumberedPageButtonProps = {
	pageNumber: number;
	totalPages: number;
	onClick?: () => void;
	highlighted?: boolean;
	disabled?: boolean;
};

export const NumberedPageButton: FC<NumberedPageButtonProps> = ({
	pageNumber,
	totalPages,
	onClick,
	highlighted = false,
	disabled = false,
}) => {
	return (
		<BasePageButton
			name="页面按钮"
			aria-label={getNumberedButtonLabel(pageNumber, totalPages, highlighted)}
			onClick={onClick}
			highlighted={highlighted}
			disabled={disabled}
		>
			{pageNumber}
		</BasePageButton>
	);
};

type PlaceholderPageButtonProps = {
	pagesOmitted: number;
	children?: ReactNode;
};

export const PlaceholderPageButton: FC<PlaceholderPageButtonProps> = ({
	pagesOmitted,
	children = <>&hellip;</>,
}) => {
	return (
		<BasePageButton
			disabled
			name="省略的页码"
			aria-label={`省略了${pagesOmitted}页`}
		>
			{children}
		</BasePageButton>
	);
};

type BasePageButtonProps = {
	children?: ReactNode;
	onClick?: () => void;
	name: string;
	"aria-label": string;
	highlighted?: boolean;
	disabled?: boolean;
};

const BasePageButton: FC<BasePageButtonProps> = ({
	children,
	onClick,
	name,
	"aria-label": ariaLabel,
	highlighted = false,
	disabled = false,
}) => {
	return (
		<Button
			variant={highlighted ? "default" : "outline"}
			size="icon"
			aria-label={ariaLabel}
			name={name}
			disabled={disabled}
			onClick={onClick}
			className="min-w-8 w-auto"
		>
			{children}
		</Button>
	);
};

function getNumberedButtonLabel(
	page: number,
	totalPages: number,
	highlighted: boolean,
): string {
	if (highlighted) {
		return "当前页";
	}

	if (page === 1) {
		return "第一页";
	}

	if (page === totalPages) {
		return "最后一页";
	}

	return `第${page}页`;
}
