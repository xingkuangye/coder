import type { FC } from "react";
import { useState } from "react";
import type { AssignableRoles } from "#/api/typesGenerated";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { RoleSelector } from "#/modules/roles/RoleSelector";

interface DefaultRolesDialogProps {
	open: boolean;
	currentRoles: readonly string[];
	availableRoles?: AssignableRoles[];
	onCancel: () => void;
	onConfirm: (roles: string[]) => Promise<void>;
	isUpdating: boolean;
}

export const DefaultRolesDialog: FC<DefaultRolesDialogProps> = ({
	open,
	currentRoles,
	availableRoles,
	onCancel,
	onConfirm,
	isUpdating,
}) => {
	if (!open) {
		return null;
	}

	return (
		<ActiveDefaultRolesDialog
			currentRoles={currentRoles}
			availableRoles={availableRoles ?? []}
			onCancel={onCancel}
			onConfirm={onConfirm}
			isUpdating={isUpdating}
		/>
	);
};

interface ActiveProps {
	currentRoles: readonly string[];
	availableRoles: AssignableRoles[];
	onCancel: () => void;
	onConfirm: (roles: string[]) => Promise<void>;
	isUpdating: boolean;
}

const ActiveDefaultRolesDialog: FC<ActiveProps> = ({
	currentRoles,
	availableRoles,
	onCancel,
	onConfirm,
	isUpdating,
}) => {
	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(currentRoles),
	);

	return (
		<Dialog
			open
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>编辑默认角色</DialogTitle>
					<DialogDescription>
						这些角色将分配给该组织的每个成员。不选择任何角色将仅授予新成员 floor 权限。
					</DialogDescription>
				</DialogHeader>
				<RoleSelector
					hideLabel
					availableRoles={availableRoles}
					selectedRoles={selected}
					onChange={setSelected}
				/>
				<DialogFooter>
					<DialogActions
						onCancel={onCancel}
						onConfirm={() => onConfirm([...selected])}
						confirmLoading={isUpdating}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
