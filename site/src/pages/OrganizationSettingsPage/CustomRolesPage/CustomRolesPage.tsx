import { type FC, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { updateOrganization } from "#/api/queries/organizations";
import { deleteOrganizationRole, organizationRoles } from "#/api/queries/roles";
import type { Role } from "#/api/typesGenerated";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { useFeatureVisibility } from "#/modules/dashboard/useFeatureVisibility";
import { useOrganizationSettings } from "#/modules/management/OrganizationSettingsLayout";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { pageTitle } from "#/utils/page";
import { CustomRolesPageView } from "./CustomRolesPageView";

const CustomRolesPage: FC = () => {
	const queryClient = useQueryClient();
	const { custom_roles: isCustomRolesEnabled } = useFeatureVisibility();
	const { organization: organizationName } = useParams() as {
		organization: string;
	};
	const { organization, organizationPermissions } = useOrganizationSettings();
	const { experiments, entitlements } = useDashboard();
	const defaultRolesEnabled = experiments.includes("minimum-implicit-member");
	const defaultRolesEntitled =
		entitlements.features.multiple_organizations.enabled;

	const [roleToDelete, setRoleToDelete] = useState<Role>();

	const organizationRolesQuery = useQuery(organizationRoles(organizationName));
	const builtInRoles = organizationRolesQuery.data?.filter(
		(role) => role.built_in,
	);
	const customRoles = organizationRolesQuery.data?.filter(
		(role) => !role.built_in,
	);

	const deleteRoleMutation = useMutation(
		deleteOrganizationRole(queryClient, organizationName),
	);
	const updateOrganizationMutation = useMutation(
		updateOrganization(queryClient),
	);

	useEffect(() => {
		if (organizationRolesQuery.error) {
			toast.error(
				getErrorMessage(
					organizationRolesQuery.error,
					"加载自定义角色失败。",
				),
				{
					description: getErrorDetail(organizationRolesQuery.error),
				},
			);
		}
	}, [organizationRolesQuery.error]);

	if (!organization) {
		return <EmptyState message="未找到组织" />;
	}

	return (
		<div className="w-full max-w-screen-2xl pb-10">
			<title>
				{pageTitle(
					"自定义角色",
					organization.display_name || organization.name,
				)}
			</title>

			<RequirePermission
				isFeatureVisible={organizationPermissions?.viewOrgRoles ?? false}
			>
				<div className="flex flex-row gap-4 items-baseline justify-between">
					<SettingsHeader>
						<SettingsHeaderTitle>角色</SettingsHeaderTitle>
						<SettingsHeaderDescription>
							管理此组织的角色。
						</SettingsHeaderDescription>
					</SettingsHeader>
				</div>

				<CustomRolesPageView
					organization={organization}
					builtInRoles={builtInRoles}
					customRoles={customRoles}
					onDeleteRole={setRoleToDelete}
					canCreateOrgRole={organizationPermissions?.createOrgRoles ?? false}
					canUpdateOrgRole={organizationPermissions?.updateOrgRoles ?? false}
					canDeleteOrgRole={organizationPermissions?.deleteOrgRoles ?? false}
					canEditDefaultRoles={organizationPermissions?.editSettings ?? false}
					isCustomRolesEnabled={isCustomRolesEnabled}
					defaultRolesEnabled={defaultRolesEnabled}
					defaultRolesEntitled={defaultRolesEntitled}
					availableOrgRoles={organizationRolesQuery.data}
					isUpdatingDefaultRoles={updateOrganizationMutation.isPending}
					onUpdateDefaultRoles={async (roles) => {
						try {
							await updateOrganizationMutation.mutateAsync({
								organizationId: organization.id,
								req: { default_org_member_roles: roles },
							});
							toast.success("默认角色已更新。");
						} catch (error) {
							toast.error(
								getErrorMessage(error, "更新默认角色失败。"),
								{ description: getErrorDetail(error) },
							);
						}
					}}
				/>

				<DeleteDialog
					key={roleToDelete?.name}
					isOpen={roleToDelete !== undefined}
					confirmLoading={deleteRoleMutation.isPending}
					name={roleToDelete?.name ?? ""}
					entity="角色"
					onCancel={() => setRoleToDelete(undefined)}
					onConfirm={async () => {
						try {
							if (roleToDelete) {
								await deleteRoleMutation.mutateAsync(roleToDelete.name, {
									onSuccess: () => {
										setRoleToDelete(undefined);
										organizationRolesQuery.refetch();
									},
								});
							}
							toast.success(
								roleToDelete
									? `自定义角色 "${roleToDelete.name}" 已成功删除。`
									: "自定义角色已成功删除。",
							);
						} catch (error) {
							toast.error(
								getErrorMessage(error, "删除自定义角色失败。"),
								{
									description: getErrorDetail(error),
								},
							);
						}
					}}
				/>
			</RequirePermission>
		</div>
	);
};

export default CustomRolesPage;
