import { EllipsisVerticalIcon } from "lucide-react";
import { type FC, useId, useState } from "react";
import { Button } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";

type AgentDevcontainerMoreActionsProps = {
	deleteDevContainer: () => void;
};

export const AgentDevcontainerMoreActions: FC<
	AgentDevcontainerMoreActionsProps
> = ({ deleteDevContainer }) => {
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
	const [open, setOpen] = useState(false);
	const menuContentId = useId();

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button size="icon-lg" variant="subtle" aria-controls={menuContentId}>
					<EllipsisVerticalIcon aria-hidden="true" />
					<span className="sr-only">Dev Container 操作</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent id={menuContentId} align="end">
				<DropdownMenuItem
					className="text-content-destructive focus:text-content-destructive"
					onClick={() => {
						setIsConfirmingDelete(true);
					}}
				>
					删除&hellip;
				</DropdownMenuItem>
			</DropdownMenuContent>

			<DevcontainerDeleteDialog
				isOpen={isConfirmingDelete}
				onCancel={() => setIsConfirmingDelete(false)}
				onConfirm={() => {
					deleteDevContainer();
					setIsConfirmingDelete(false);
				}}
			/>
		</DropdownMenu>
	);
};

type DevcontainerDeleteDialogProps = {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

const DevcontainerDeleteDialog: FC<DevcontainerDeleteDialogProps> = ({
	isOpen,
	onCancel,
	onConfirm,
}) => {
	return (
		<ConfirmDialog
			type="delete"
			open={isOpen}
			title="删除 Dev Container"
			onConfirm={onConfirm}
			onClose={onCancel}
			description={
				<p>
					确定要删除此 Dev Container 吗？所有未保存的工作都将丢失。
				</p>
			}
		/>
	);
};
