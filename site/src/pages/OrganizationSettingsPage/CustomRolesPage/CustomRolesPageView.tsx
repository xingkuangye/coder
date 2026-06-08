import { EllipsisVerticalIcon, PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import type { AssignableRoles, Organization, Role } from "#/api/typesGenerated";
import { PremiumBadge } from "#/components/Badges/Badges";
import { Button, Button as ShadcnButton } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import {
	TableLoaderSkeleton,
	TableRowSkeleton,
} from "#/components/TableLoader/TableLoader";
import { docs } from "#/utils/docs";
import { DefaultRolesDialog } from "./DefaultRolesDialog";
import { PermissionPillsList } from "./PermissionPillsList";

interface CustomRolesPageViewProps {
	organization: Organization;
	builtInRoles: AssignableRoles[] | undefined;
	customRoles: AssignableRoles[] | undefined;
	onDeleteRole: (role: Role) => void;
	canCreateOrgRole: boolean;
	canUpdateOrgRole: boolean;
	canDeleteOrgRole: boolean;
	canEditDefaultRoles: boolean;
	isCustomRolesEnabled: boolean;
	defaultRolesEnabled?: boolean;
	defaultRolesEntitled?: boolean;
	availableOrgRoles?: AssignableRoles[];
	onUpdateDefaultRoles?: (roles: string[]) => Promise<void>;
	isUpdatingDefaultRoles?: boolean;
}

export const CustomRolesPageView: FC<CustomRolesPageViewProps> = ({
	organization,
	builtInRoles,
	customRoles,
	onDeleteRole,
	canCreateOrgRole,
	canUpdateOrgRole,
	canDeleteOrgRole,
	canEditDefaultRoles,
	isCustomRolesEnabled,
	defaultRolesEnabled,
	defaultRolesEntitled,
	availableOrgRoles,
	onUpdateDefaultRoles,
	isUpdatingDefaultRoles,
}) => {
	const showDefaultRoles =
		defaultRolesEnabled && canEditDefaultRoles && Boolean(onUpdateDefaultRoles);

	return (
		<div className="flex flex-col gap-8">
			{!isCustomRolesEnabled && (
				<PaywallPremium
					message="自定义角色"
					description="创建自定义角色，为用户授予量身定制的细粒度权限集。"
					documentationLink={docs("/admin/users/groups-roles")}
				/>
			)}
			{showDefaultRoles && onUpdateDefaultRoles && (
				<DefaultRolesSection
					organization={organization}
					availableOrgRoles={availableOrgRoles}
					defaultRolesEntitled={Boolean(defaultRolesEntitled)}
					isUpdatingDefaultRoles={Boolean(isUpdatingDefaultRoles)}
					onUpdateDefaultRoles={onUpdateDefaultRoles}
				/>
			)}
			<div className="flex flex-row gap-4 items-baseline justify-between">
				<span>
					<h2 className="mb-0 text-lg">自定义角色</h2>
					<span className="text-sm text-content-secondary leading-relaxed">
						创建自定义角色，为用户授予量身定制的细粒度权限集。
					</span>
				</span>
				{canCreateOrgRole && isCustomRolesEnabled && (
					<Button variant="outline" asChild>
						<RouterLink to="create">
							<PlusIcon />
							创建自定义角色
						</RouterLink>
					</Button>
				)}
			</div>
			<RoleTable
				roles={customRoles}
				isCustomRolesEnabled={isCustomRolesEnabled}
				canCreateOrgRole={canCreateOrgRole}
				canUpdateOrgRole={canUpdateOrgRole}
				canDeleteOrgRole={canDeleteOrgRole}
				onDeleteRole={onDeleteRole}
			/>
			<span>
				<h2 className="mb-0 text-lg">内置角色</h2>
				<span className="text-sm text-content-secondary leading-relaxed">
					内置角色具有预定义的权限。您无法编辑或删除内置角色。
				</span>
			</span>
			<RoleTable
				roles={builtInRoles}
				isCustomRolesEnabled={isCustomRolesEnabled}
				canCreateOrgRole={canCreateOrgRole}
				canUpdateOrgRole={canUpdateOrgRole}
				canDeleteOrgRole={canDeleteOrgRole}
				onDeleteRole={onDeleteRole}
			/>
		</div>
	);
};

interface DefaultRolesSectionProps {
	organization: Organization;
	availableOrgRoles?: AssignableRoles[];
	defaultRolesEntitled: boolean;
	isUpdatingDefaultRoles: boolean;
	onUpdateDefaultRoles: (roles: string[]) => Promise<void>;
}

const DefaultRolesSection: FC<DefaultRolesSectionProps> = ({
	organization,
	availableOrgRoles,
	defaultRolesEntitled,
	isUpdatingDefaultRoles,
	onUpdateDefaultRoles,
}) => {
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-row gap-4 items-baseline justify-between">
				<span>
					<h2 className="mb-0 text-lg flex items-center gap-2">
						默认角色
						{!defaultRolesEntitled && <PremiumBadge />}
					</h2>
					<span className="text-sm text-content-secondary leading-relaxed">
						附加到此组织每个成员的角色。空选择仅将新成员限制为最低权限。
					</span>
				</span>
				<Button
					type="button"
					variant="outline"
					onClick={() => setIsEditing(true)}
					disabled={isUpdatingDefaultRoles || !defaultRolesEntitled}
				>
					编辑默认角色
				</Button>
			</div>
			<div className="text-sm">
				{organization.default_org_member_roles.length === 0 ? (
					<span className="text-content-secondary">
						无默认角色。新成员仅获得最低权限。
					</span>
				) : (
					<DefaultRolesSummary
						roleNames={organization.default_org_member_roles}
						availableRoles={availableOrgRoles}
					/>
				)}
			</div>
			{!defaultRolesEntitled && (
				<p className="text-xs text-content-secondary mt-0 mb-0">
					编辑组织设置需要 Premium 许可证。
				</p>
			)}
			<DefaultRolesDialog
				open={isEditing}
				currentRoles={organization.default_org_member_roles}
				availableRoles={availableOrgRoles}
				onCancel={() => setIsEditing(false)}
				onConfirm={async (roles) => {
					await onUpdateDefaultRoles(roles);
					setIsEditing(false);
				}}
				isUpdating={isUpdatingDefaultRoles}
			/>
		</div>
	);
};

interface DefaultRolesSummaryProps {
	roleNames: readonly string[];
	availableRoles?: AssignableRoles[];
}

const DefaultRolesSummary: FC<DefaultRolesSummaryProps> = ({
	roleNames,
	availableRoles,
}) => {
	const displayNameFor = (name: string): string => {
		const role = availableRoles?.find((r) => r.name === name);
		return role?.display_name || role?.name || name;
	};

	return (
		<ul className="list-disc pl-5 m-0 flex flex-col gap-1">
			{roleNames.map((name) => (
				<li key={name}>{displayNameFor(name)}</li>
			))}
		</ul>
	);
};

interface RoleTableProps {
	roles: AssignableRoles[] | undefined;
	isCustomRolesEnabled: boolean;
	canCreateOrgRole: boolean;
	canUpdateOrgRole: boolean;
	canDeleteOrgRole: boolean;
	onDeleteRole: (role: Role) => void;
}

const RoleTable: FC<RoleTableProps> = ({
	roles,
	isCustomRolesEnabled,
	canCreateOrgRole,
	canUpdateOrgRole,
	canDeleteOrgRole,
	onDeleteRole,
}) => {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-2/5">名称</TableHead>
					<TableHead className="w-3/5">权限</TableHead>
					<TableHead className="w-auto" />
				</TableRow>
			</TableHeader>
			<TableBody>
				<RoleTableBody
					roles={roles}
					isCustomRolesEnabled={isCustomRolesEnabled}
					canCreateOrgRole={canCreateOrgRole}
					canUpdateOrgRole={canUpdateOrgRole}
					canDeleteOrgRole={canDeleteOrgRole}
					onDeleteRole={onDeleteRole}
				/>
			</TableBody>
		</Table>
	);
};

const RoleTableBody: FC<RoleTableProps> = ({
	roles,
	isCustomRolesEnabled,
	canCreateOrgRole,
	canUpdateOrgRole,
	canDeleteOrgRole,
	onDeleteRole,
}) => {
	if (roles === undefined) {
		return <TableLoader />;
	}
	if (roles.length === 0) {
		return (
			<TableRow className="h-14">
				<TableCell colSpan={999}>
					<EmptyState
						message="尚无自定义角色"
						description={
							canCreateOrgRole && isCustomRolesEnabled
								? "创建您的第一个自定义角色"
								: !isCustomRolesEnabled
									? "升级到 Premium 许可证以创建自定义角色"
									: "您没有创建自定义角色的权限"
						}
						cta={
							canCreateOrgRole &&
							isCustomRolesEnabled && (
								<Button asChild>
									<RouterLink to="create">
										<PlusIcon />
										创建自定义角色
									</RouterLink>
								</Button>
							)
						}
					/>
				</TableCell>
			</TableRow>
		);
	}
	return (
		<>
			{[...roles]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((role) => (
					<RoleRow
						key={role.name}
						role={role}
						canUpdateOrgRole={canUpdateOrgRole}
						canDeleteOrgRole={canDeleteOrgRole}
						onDelete={() => onDeleteRole(role)}
					/>
				))}
		</>
	);
};

interface RoleRowProps {
	role: AssignableRoles;
	canUpdateOrgRole: boolean;
	canDeleteOrgRole: boolean;
	onDelete: () => void;
}

const RoleRow: FC<RoleRowProps> = ({
	role,
	onDelete,
	canUpdateOrgRole,
	canDeleteOrgRole,
}) => {
	const navigate = useNavigate();

	return (
		<TableRow data-testid={`role-${role.name}`} className="h-14">
			<TableCell>{role.display_name || role.name}</TableCell>

			<TableCell>
				<PermissionPillsList permissions={role.organization_permissions} />
			</TableCell>

			<TableCell>
				{!role.built_in && (canUpdateOrgRole || canDeleteOrgRole) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<ShadcnButton
								size="icon-lg"
								variant="subtle"
								aria-label="打开菜单"
							>
								<EllipsisVerticalIcon aria-hidden="true" />
								<span className="sr-only">打开菜单</span>
							</ShadcnButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{canUpdateOrgRole && (
								<DropdownMenuItem onClick={() => navigate(role.name)}>
									编辑
								</DropdownMenuItem>
							)}
							{canDeleteOrgRole && (
								<DropdownMenuItem
									className="text-content-destructive focus:text-content-destructive"
									onClick={onDelete}
								>
									删除&hellip;
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</TableCell>
		</TableRow>
	);
};

const TableLoader = () => {
	return (
		<TableLoaderSkeleton>
			<TableRowSkeleton>
				<TableCell>
					<Skeleton variant="text" width="25%" />
				</TableCell>
				<TableCell>
					<Skeleton variant="text" width="25%" />
				</TableCell>
				<TableCell>
					<Skeleton variant="text" width="25%" />
				</TableCell>
			</TableRowSkeleton>
		</TableLoaderSkeleton>
	);
};
