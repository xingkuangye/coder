import type { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	createOrganizationRole,
	organizationRoles,
	updateOrganizationRole,
} from "#/api/queries/roles";
import type { CustomRoleRequest } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Loader } from "#/components/Loader/Loader";
import { useOrganizationSettings } from "#/modules/management/OrganizationSettingsLayout";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { pageTitle } from "#/utils/page";
import CreateEditRolePageView from "./CreateEditRolePageView";

const CreateEditRolePage: FC = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { organization: organizationName, roleName } = useParams() as {
		organization: string;
		roleName: string;
	};
	const { organizationPermissions } = useOrganizationSettings();
	const createOrganizationRoleMutation = useMutation(
		createOrganizationRole(queryClient, organizationName),
	);
	const updateOrganizationRoleMutation = useMutation(
		updateOrganizationRole(queryClient, organizationName),
	);
	const { data: roleData, isLoading } = useQuery(
		organizationRoles(organizationName),
	);
	const role = roleData?.find((role) => role.name === roleName);

	if (isLoading) {
		return <Loader />;
	}

	if (!organizationPermissions) {
		return <ErrorAlert error="无法加载组织权限" />;
	}

	return (
		<RequirePermission
			isFeatureVisible={
				role
					? organizationPermissions.updateOrgRoles
					: organizationPermissions.createOrgRoles
			}
		>
			<title>
				{pageTitle(
					role !== undefined ? "编辑自定义角色" : "创建自定义角色",
				)}
			</title>

			<CreateEditRolePageView
				role={role}
				onSubmit={async (data: CustomRoleRequest) => {
					const mutation = role
						? updateOrganizationRoleMutation.mutateAsync(data, {
								onSuccess: () => {
									navigate(`/organizations/${organizationName}/roles`);
								},
							})
						: createOrganizationRoleMutation.mutateAsync(data, {
								onSuccess: () => {
									navigate(`/organizations/${organizationName}/roles`);
								},
							});
					toast.promise(
						mutation,
						role
							? {
									loading: `正在更新自定义角色 "${data.name}"...`,
									success: `自定义角色 "${data.name}" 更新成功。`,
									error: (error) => ({
										message: getErrorMessage(
											error,
											`更新自定义角色 "${data.name}" 失败。`,
										),
										description: getErrorDetail(error),
									}),
								}
							: {
									loading: `正在创建自定义角色 "${data.name}"...`,
									success: `自定义角色 "${data.name}" 创建成功。`,
									error: (error) => ({
										message: getErrorMessage(
											error,
											`创建自定义角色 "${data.name}" 失败。`,
										),
										description: getErrorDetail(error),
									}),
								},
					);
				}}
				error={
					role
						? updateOrganizationRoleMutation.error
						: createOrganizationRoleMutation.error
				}
				isLoading={
					role
						? updateOrganizationRoleMutation.isPending
						: createOrganizationRoleMutation.isPending
				}
				organizationName={organizationName}
			/>
		</RequirePermission>
	);
};

export default CreateEditRolePage;
