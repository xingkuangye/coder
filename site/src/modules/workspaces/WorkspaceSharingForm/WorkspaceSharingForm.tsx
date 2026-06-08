import { EllipsisVerticalIcon, UserPlusIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import { useQuery } from "react-query";
import { workspaceSharingSettings } from "#/api/queries/organizations";
import type {
	Group,
	WorkspaceACL,
	WorkspaceGroup,
	WorkspaceRole,
	WorkspaceUser,
} from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Avatar } from "#/components/Avatar/Avatar";
import { AvatarData } from "#/components/Avatar/AvatarData";
import { Button } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import { getGroupSubtitle } from "#/modules/groups";

interface RoleSelectProps {
	value: WorkspaceRole;
	disabled?: boolean;
	onValueChange: (value: WorkspaceRole) => void;
}

const RoleSelect: FC<RoleSelectProps> = ({
	value,
	disabled,
	onValueChange,
}) => {
	const roleLabels: Record<WorkspaceRole, string> = {
		use: "使用",
		admin: "管理员",
		"": "",
	};

	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger className="w-40 h-auto">
				<SelectValue>
					<span className="bg-surface-secondary rounded-md px-3 py-0.5 inline-block">
						{roleLabels[value]}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="use" className="flex-col items-start py-2 w-64">
					<div className="font-medium text-content-primary">使用</div>
					<div className="text-xs text-content-secondary leading-snug mt-0.5">
						可以读取、访问、启动和停止此工作区。
					</div>
				</SelectItem>
				<SelectItem value="admin" className="flex-col items-start py-2 w-64">
					<div className="font-medium text-content-primary">管理员</div>
					<div className="text-xs text-content-secondary leading-snug mt-0.5">
						可以管理工作区元数据、权限和设置。
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	);
};

type AddWorkspaceMemberFormProps = {
	isLoading: boolean;
	onSubmit: () => void;
	disabled: boolean;
	children: ReactNode;
};

export const AddWorkspaceMemberForm: FC<AddWorkspaceMemberFormProps> = ({
	isLoading,
	onSubmit,
	disabled,
	children,
}) => {
	return (
		<form action={onSubmit}>
			<div className="flex flex-row items-center gap-2">
				{children}
				<Button disabled={disabled || isLoading} type="submit">
					<Spinner loading={isLoading}>
						<UserPlusIcon className="size-icon-sm" />
					</Spinner>
					添加成员
				</Button>
			</div>
		</form>
	);
};

type RoleSelectFieldProps = {
	value: WorkspaceRole;
	onChange: (value: WorkspaceRole) => void;
	disabled?: boolean;
};

export const RoleSelectField: FC<RoleSelectFieldProps> = ({
	value,
	onChange,
	disabled,
}) => {
	return (
		<Select
			value={value}
			onValueChange={(val: WorkspaceRole) => onChange(val)}
			disabled={disabled}
		>
			<SelectTrigger className="w-40">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="use">使用</SelectItem>
				<SelectItem value="admin">管理员</SelectItem>
			</SelectContent>
		</Select>
	);
};

const roleDisplayNames: Record<WorkspaceRole, string> = {
	use: "使用",
	admin: "管理员",
	"": "",
};

interface WorkspaceSharingFormProps {
	organizationId: string;
	workspaceACL: WorkspaceACL | undefined;
	canUpdatePermissions: boolean;
	error: unknown;
	onUpdateUser: (user: WorkspaceUser, role: WorkspaceRole) => void;
	updatingUserId: WorkspaceUser["id"] | undefined;
	onRemoveUser: (user: WorkspaceUser) => void;
	onUpdateGroup: (group: WorkspaceGroup, role: WorkspaceRole) => void;
	updatingGroupId?: WorkspaceGroup["id"] | undefined;
	onRemoveGroup: (group: Group) => void;
	addMemberForm?: ReactNode;
	isCompact?: boolean;
	showRestartWarning?: boolean;
}

export const WorkspaceSharingForm: FC<WorkspaceSharingFormProps> = ({
	organizationId,
	workspaceACL,
	canUpdatePermissions,
	error,
	updatingUserId,
	onUpdateUser,
	onRemoveUser,
	updatingGroupId,
	onUpdateGroup,
	onRemoveGroup,
	addMemberForm,
	isCompact,
	showRestartWarning,
}) => {
	const sharingSettingsQuery = useQuery(
		workspaceSharingSettings(organizationId),
	);

	if (sharingSettingsQuery.isLoading) {
		return (
			<TableBody>
				<TableLoader />
			</TableBody>
		);
	}

	if (!sharingSettingsQuery.data) {
		return (
			<TableBody>
				<TableRow>
					<TableCell colSpan={999}>
						<ErrorAlert error={sharingSettingsQuery.error} />
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}

	if (sharingSettingsQuery.data.sharing_disabled) {
		return (
			<TableBody>
				<TableRow>
					<TableCell colSpan={999}>
						<EmptyState
							message="此工作区无法共享"
							description="此组织已禁用工作区共享。"
							isCompact={isCompact}
						/>
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}

	const isEmpty = Boolean(
		workspaceACL &&
			workspaceACL.users.length === 0 &&
			workspaceACL.group.length === 0,
	);

	const tableHeader = (
		<TableHeader>
			<TableRow>
				<TableHead className="w-[50%] py-2">成员</TableHead>
				<TableHead className="w-[40%] py-2">角色</TableHead>
				<TableHead className="w-[10%] py-2" />
			</TableRow>
		</TableHeader>
	);

	const tableBody = (
		<TableBody>
			{!workspaceACL ? (
				<TableLoader />
			) : isEmpty ? (
				<TableRow>
					<TableCell colSpan={999}>
						<EmptyState
							message="尚无共享成员或组"
							description="使用上方的控件添加成员或组。"
							isCompact={isCompact}
						/>
					</TableCell>
				</TableRow>
			) : (
				<>
					{workspaceACL.group.map((group) => (
						<TableRow key={group.id}>
							<TableCell className="py-2 w-[50%]">
								<AvatarData
									avatar={
										<Avatar
											size="lg"
											fallback={group.display_name || group.name}
											src={group.avatar_url}
										/>
									}
									title={group.display_name || group.name}
									subtitle={getGroupSubtitle(group)}
								/>
							</TableCell>
							<TableCell className="py-2 w-[40%]">
								{canUpdatePermissions ? (
									<RoleSelect
										value={group.role}
										disabled={updatingGroupId === group.id}
										onValueChange={(value) => onUpdateGroup(group, value)}
									/>
								) : (
									<div className="capitalize">{roleDisplayNames[group.role]}</div>
								)}
							</TableCell>

							<TableCell className="py-2 w-[10%]">
								{canUpdatePermissions && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												size="icon-lg"
												variant="subtle"
												aria-label="打开菜单"
											>
												<EllipsisVerticalIcon aria-hidden="true" />
												<span className="sr-only">打开菜单</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												className="text-content-destructive focus:text-content-destructive"
												onClick={() => onRemoveGroup(group)}
											>
												移除
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</TableCell>
						</TableRow>
					))}

					{workspaceACL.users.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="py-2 w-[50%]">
								<AvatarData
									title={user.username}
									subtitle={user.name}
									src={user.avatar_url}
								/>
							</TableCell>
							<TableCell className="py-2 w-[40%]">
								{canUpdatePermissions ? (
									<RoleSelect
										value={user.role}
										disabled={updatingUserId === user.id}
										onValueChange={(value) => onUpdateUser(user, value)}
									/>
								) : (
									<div className="capitalize">{roleDisplayNames[user.role]}</div>
								)}
							</TableCell>

							<TableCell className="py-2 w-[10%]">
								{canUpdatePermissions && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												size="icon-lg"
												variant="subtle"
												aria-label="打开菜单"
											>
												<EllipsisVerticalIcon aria-hidden="true" />
												<span className="sr-only">打开菜单</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												className="text-content-destructive focus:text-content-destructive"
												onClick={() => onRemoveUser(user)}
											>
												移除
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</TableCell>
						</TableRow>
					))}
				</>
			)}
		</TableBody>
	);

	if (isCompact) {
		return (
			<div className="flex flex-col gap-4">
				{Boolean(error) && <ErrorAlert error={error} />}
				{canUpdatePermissions && addMemberForm}
				{showRestartWarning && (
					<Alert severity="warning">
						需要重启工作区才能使移除生效。
					</Alert>
				)}
				<div>
					<Table>{tableHeader}</Table>
					<div className="max-h-60 overflow-y-auto">
						<Table>{tableBody}</Table>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{Boolean(error) && <ErrorAlert error={error} />}
			{canUpdatePermissions && addMemberForm}
			{showRestartWarning && (
				<Alert severity="warning">
					需要重启工作区才能使移除生效。
				</Alert>
			)}
			<Table>
				{tableHeader}
				{tableBody}
			</Table>
		</div>
	);
};
