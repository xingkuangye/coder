import { EllipsisVerticalIcon } from "lucide-react";
import { Link } from "react-router";
import type {
	Group,
	OrganizationMemberWithUserData,
} from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import { AvatarData } from "#/components/Avatar/AvatarData";
import { PremiumBadge } from "#/components/Badges/Badges";
import { Button } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { Loader } from "#/components/Loader/Loader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { AISeatCell } from "#/modules/users/AISeatCell";
import { UserGroupsCell } from "#/modules/users/UserGroupsCell";
import {
	AiAddonHelpPopover,
	GroupsHelpPopover,
	RolesHelpPopover,
} from "#/modules/users/UserHelpPopovers";
import { UserRoleCell } from "#/modules/users/UserRoleCell";

export type OrganizationMembersTableProps = {
	// State
	organizationName: string;
	members: Array<OrganizationMemberTableEntry> | undefined;
	showAISeatColumn?: boolean;

	// Actions
	onEditMemberRoles: (member: OrganizationMemberWithUserData) => void;
	isUpdatingMemberRoles: boolean;
	removeMember: (member: OrganizationMemberWithUserData) => void;

	// Permissions
	/**
	 * Used to disable the UI of actions that users cannot perform on themselves,
	 * like delete.
	 */
	me: string;
	canEditMembers: boolean;
	canViewActivity: boolean;
};

type OrganizationMemberTableEntry = OrganizationMemberWithUserData & {
	groups: readonly Group[] | undefined;
};

export const OrganizationMembersTable: React.FC<
	OrganizationMembersTableProps
> = (props) => {
	const { showAISeatColumn } = props;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-max">用户</TableHead>
					<TableHead className="w-1/6">
						<div className="flex flex-row items-center gap-2">
							<span>角色</span>
							<RolesHelpPopover />
						</div>
					</TableHead>
					<TableHead className="w-1/6">
						<div className="flex flex-row items-center gap-2">
							<span>组</span>
							<GroupsHelpPopover />
						</div>
					</TableHead>
					{showAISeatColumn && (
						<TableHead className="w-1/6">
							<div className="flex flex-row items-center gap-2">
								<span>AI 附加组件</span>
								<AiAddonHelpPopover />
							</div>
						</TableHead>
					)}
				</TableRow>
			</TableHeader>
			<TableBody>
				<OrganizationMembersTableBody {...props} />
			</TableBody>
		</Table>
	);
};

const OrganizationMembersTableBody: React.FC<OrganizationMembersTableProps> = ({
	organizationName,
	members,
	showAISeatColumn,

	isUpdatingMemberRoles,
	removeMember,
	onEditMemberRoles,

	me,
	canEditMembers,
	canViewActivity,
}) => {
	if (!members) {
		return (
			<TableRow>
				<TableCell colSpan={999}>
					<Loader />
				</TableCell>
			</TableRow>
		);
	}

	return (
		<>
			{members.map((member) => (
				<TableRow key={member.user_id} className="align-baseline">
					<TableCell>
						<AvatarData
							avatar={
								<Avatar
									fallback={member.username}
									src={member.avatar_url}
									size="lg"
								/>
							}
							title={member.name || member.username}
							subtitle={member.email}
						/>
					</TableCell>
					<UserRoleCell
						globalRoles={member.global_roles}
						roles={member.roles}
					/>
					<UserGroupsCell userGroups={member.groups} />
					{showAISeatColumn && <AISeatCell hasAISeat={member.has_ai_seat} />}
					<TableCell className="w-px whitespace-nowrap text-right">
						<div className="flex justify-end">
							{member.user_id !== me && canEditMembers && (
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
										<DropdownMenuItem asChild>
											<Link
												to={`/workspaces?filter=${encodeURIComponent(`owner:${member.username} organization:${organizationName}`)}`}
											>
												查看工作区
											</Link>
										</DropdownMenuItem>

										{canViewActivity && (
											<DropdownMenuItem asChild disabled={!canViewActivity}>
												<Link
													to={`/audit?filter=${encodeURIComponent(`username:${member.username} organization:${organizationName}`)}`}
												>
													查看活动 {!canViewActivity && <PremiumBadge />}
												</Link>
											</DropdownMenuItem>
										)}

										<DropdownMenuItem
											disabled={isUpdatingMemberRoles}
											onClick={() => onEditMemberRoles(member)}
										>
											编辑角色
										</DropdownMenuItem>

										<DropdownMenuSeparator />

										<DropdownMenuItem
											className="text-content-destructive focus:text-content-destructive"
											onClick={() => removeMember(member)}
										>
											移除&hellip;
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</TableCell>
				</TableRow>
			))}
		</>
	);
};
