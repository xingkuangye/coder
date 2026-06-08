import { CircleCheckIcon, XIcon } from "lucide-react";
import type { FC } from "react";
import { TableCell } from "#/components/Table/Table";

interface AISeatCellProps {
	hasAISeat: boolean;
}

export const AISeatCell: FC<AISeatCellProps> = ({ hasAISeat }) => {
	return (
		<TableCell>
			{hasAISeat ? (
				<CircleCheckIcon
					className="size-5 text-content-success"
					aria-label="占用AI席位"
				/>
			) : (
				<XIcon
					className="size-5 text-content-disabled"
					aria-label="未占用AI席位"
				/>
			)}
		</TableCell>
	);
};
