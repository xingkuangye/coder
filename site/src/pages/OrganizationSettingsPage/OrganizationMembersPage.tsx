import { type FC, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { groupsByUserIdInOrganization } from "#/api/queries/groups";
import {
	addOrganizationMember,
	paginatedOrganizationMembers,
	removeOrganizationMember,
	updateOrganizationMemberRoles,
} from "#/api/queries/organizations";
import { organizationRoles } from "#/api/queries/roles";
import type {
	AssignableRoles,
	OrganizationMemberWithUserData,
	User,
} from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { useFilter } from "#/components/Filter/Filter";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { usePaginatedQuery } from "#/hooks/usePaginatedQuery";
import { shouldShowAISeatColumn } from "#/modules/dashboard/entitlements";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { useOrganizationSettings } from "#/modules/management/OrganizationSettingsLayout";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { RoleSelectorDialog } from "#/modules/roles/RoleSelectorDialog";
import { pageTitle } from "#/utils/page";
import { OrganizationMembersPageView } from "./OrganizationMembersPageView";

const OrganizationMembersPage: FC = () => {
	const queryClient = useQueryClient();
	const { user: me } = useAuthenticated();
	const { organization: organizationName } = useParams() as {
		organization: string;
	};
	const { organization, organizationPermissions } = useOrganizationSettings();
	const { entitlements, experiments } = useDashboard();
	const searchParamsResult = useSearchParams();
	const showAISeatColumn = shouldShowAISeatColumn(entitlements);
	const defaultRolesEnabled = experiments.includes("minimum-implicit-member");

	const organizationRolesQuery = useQuery(organizationRoles(organizationName));
	const groupsByUserIdQuery = useQuery(
		groupsByUserIdInOrganization(organizationName),
	);

	const membersQuery = usePaginatedQuery(
		paginatedOrganizationMembers(organizationName, searchParamsResult[0]),
	);
	const filterProps = useFilter({
		searchParams: searchParamsResult[0],
		onSearchParamsChange: searchParamsResult[1],
		onUpdate: membersQuery.goToFirstPage,
	});

	const members = membersQuery.data?.members.map(
		(member: OrganizationMemberWithUserData) => {
			const groups = groupsByUserIdQuery.data?.get(member.user_id) ?? [];
			return { ...member, groups };
		},
	);

	const addMemberMutation = useMutation(
		addOrganizationMember(queryClient, organizationName),
	);

	const [memberToEditRoles, setMemberToEditRoles] =
		useState<OrganizationMemberWithUserData>();
	const updateMemberRolesMutation = useMutation(
		updateOrganizationMemberRoles(queryClient, organizationName),
	);

	const [memberToRemove, setMemberToRemove] =
		useState<OrganizationMemberWithUserData>();
	const removeMemberMutation = useMutation(
		removeOrganizationMember(queryClient, organizationName),
	);

	// Resolve the org's default member role names against the assignable
	// roles list so the dialog can show full display names + descriptions.
	const defaultMemberImpliedRoles = useMemo<AssignableRoles[]>(() => {
		if (!defaultRolesEnabled) {
			return [];
		}
		const available = organizationRolesQuery.data;
		if (!available) {
			return [];
		}
		return (organization?.default_org_member_roles ?? [])
			.map((name) => available.find((r) => r.name === name))
			.filter((r): r is AssignableRoles => r !== undefined);
	}, [
		defaultRolesEnabled,
		organization?.default_org_member_roles,
		organizationRolesQuery.data,
	]);

	if (!organization) {
		return <EmptyState message="组织未找到" />;
	}

	const title = (
		<title>
			{pageTitle("成员", organization.display_name || organization.name)}
		</title>
	);

	if (!organizationPermissions) {
		return (
			<>
				{title}
				<RequirePermission isFeatureVisible={false} />
			</>
		);
	}

	return (
		<>
			{title}
			<OrganizationMembersPageView
				error={
					membersQuery.error ??
					organizationRolesQuery.error ??
					addMemberMutation.error ??
					removeMemberMutation.error ??
					updateMemberRolesMutation.error
				}
				filterProps={{ filter: filterProps }}
				organizationName={organizationName}
				membersQuery={membersQuery}
				members={members}
				showAISeatColumn={showAISeatColumn}
				addMembers={async (users: User[]) => {
					// TODO: Replace with a batch endpoint (POST /organizations/{org}/members)
					// to add all users in a single request instead of N individual calls.
					// See branch jakehwll/devex-112-organizations-batch-endpoint.
					await Promise.all(
						users.map((user) => addMemberMutation.mutateAsync(user.id)),
					);
					void membersQuery.refetch();
				}}
				onEditMemberRoles={setMemberToEditRoles}
				isUpdatingMemberRoles={updateMemberRolesMutation.isPending}
				removeMember={setMemberToRemove}
				me={me.id}
				canEditMembers={organizationPermissions.editMembers}
				canViewMembers={organizationPermissions.viewMembers}
				canViewActivity={entitlements.features.audit_log.enabled}
			/>

			<RoleSelectorDialog
				key={memberToEditRoles?.username}
				user={memberToEditRoles}
				availableRoles={organizationRolesQuery.data}
				additionalImpliedRoles={defaultMemberImpliedRoles}
				onCancel={() => setMemberToEditRoles(undefined)}
				onUpdateRoles={async (roles) => {
					try {
						await updateMemberRolesMutation.mutateAsync({
							userId: memberToEditRoles!.user_id,
							roles,
						});
						toast.success(
							`${memberToEditRoles!.username}的角色已更新。`,
						);
						setMemberToEditRoles(undefined);
					} catch (e) {
						toast.error(getErrorMessage(e, "更新成员角色时出错。"), {
							description: getErrorDetail(e),
						});
					}
				}}
				isUpdatingRoles={updateMemberRolesMutation.isPending}
			/>

			<ConfirmDialog
				type="delete"
				open={memberToRemove !== undefined}
				onClose={() => setMemberToRemove(undefined)}
				title="移除成员"
				confirmText="移除"
				onConfirm={() => {
					if (memberToRemove) {
						const mutation = removeMemberMutation.mutateAsync(
							memberToRemove.user_id,
							{
								onSuccess: () => {
									membersQuery.refetch();
								},
							},
						);
						toast.promise(mutation, {
							loading: `正在从 "${organization.display_name}" 中移除 "${memberToRemove.username}"…`,
							success: `"${memberToRemove.username}" 已从 "${organization.display_name}" 中移除。`,
							error: (error) =>
								getErrorMessage(
									error,
									`未能从 "${organization.display_name}" 中移除 "${memberToRemove.username}"。`,
								),
						});
						setMemberToRemove(undefined);
					}
				}}
				description={
					<div className="flex flex-col gap-4">
						<p>
							移除该成员将：
							<ul>
								<li>从该组织中的所有群组中移除该成员</li>
								<li>删除所有用户角色分配</li>
								<li>
									使与该组织关联的所有工作区成为孤儿工作区
								</li>
							</ul>
						</p>

						<p className="pb-5">您确定要移除该成员吗？</p>
					</div>
				}
			/>
		</>
	);
};

export default OrganizationMembersPage;
