import type { FC, ReactNode } from "react";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { Spinner } from "#/components/Spinner/Spinner";

interface ConfirmDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The entity type being deleted, shown in the title and button. */
	entity: string;
	/**
	 * Optional description. Defaults to "Are you sure you want to
	 * delete this {entity}? This action is irreversible."
	 */
	description?: ReactNode;
	children?: ReactNode;
	onConfirm: () => void;
	isPending?: boolean;
}

export const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({
	open,
	onOpenChange,
	entity,
	description,
	children,
	onConfirm,
	isPending = false,
}) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent variant="destructive">
			<DialogHeader>
				<DialogTitle>删除 {entity}</DialogTitle>
				<DialogDescription>
					{description ??
						`确定要删除此 ${entity} 吗？此操作不可撤销。`}
				</DialogDescription>
			</DialogHeader>
			{children}
			<DialogFooter>
				<Button
					variant="outline"
					onClick={() => onOpenChange(false)}
					disabled={isPending}
				>
					取消
				</Button>
				<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
					{isPending && <Spinner className="h-4 w-4" loading />}
					删除 {entity}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
