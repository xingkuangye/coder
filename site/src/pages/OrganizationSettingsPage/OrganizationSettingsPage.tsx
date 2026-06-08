import type { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	deleteOrganization,
	patchWorkspaceSharingSettings,
	updateOrganization,
	workspaceSharingSettings,
} from "#/api/queries/organizations";
import type { ShareableWorkspaceOwners } from "#/api/typesGenerated";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { useOrganizationSettings } from "#/modules/management/OrganizationSettingsLayout";
import { RequirePermission } from "#/modules/permissions/RequirePermission";
import { pageTitle } from "#/utils/page";
import { OrganizationSettingsPageView } from "./OrganizationSettingsPageView";

const sharingUpdatedToastLabels: Record<ShareableWorkspaceOwners, string> = {
	none: "工作空间共享已禁用。",
	service_accounts: "工作空间共享仅限服务账号。",
	everyone: "工作空间共享已对所有用户启用。",
};

const OrganizationSettingsPage: FC = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { organization, organizationPermissions } = useOrganizationSettings();

	const updateOrganizationMutation = useMutation(
		updateOrganization(queryClient),
	);
	const deleteOrganizationMutation = useMutation(
		deleteOrganization(queryClient),
	);

	const sharingSettingsQuery = useQuery({
		...workspaceSharingSettings(organization?.id ?? ""),
		enabled: Boolean(organization),
	});

	const patchSharingSettingsMutation = useMutation(
		patchWorkspaceSharingSettings(organization?.id ?? "", queryClient),
	);

	if (!organization) {
		return <EmptyState message="组织未找到" />;
	}

	const title = (
		<title>
			{pageTitle("设置", organization.display_name || organization.name)}
		</title>
	);

	if (!organizationPermissions?.editSettings) {
		return (
			<>
				{title}
				<RequirePermission isFeatureVisible={false} />
			</>
		);
	}

	const error =
		updateOrganizationMutation.error ?? deleteOrganizationMutation.error;

	const handleChangeShareableOwners = async (
		value: ShareableWorkspaceOwners,
	) => {
		const mutation = patchSharingSettingsMutation.mutateAsync({
			shareable_workspace_owners: value,
		});

		toast.promise(mutation, {
			loading: "正在更新工作空间共享设置……",
			success: sharingUpdatedToastLabels[value],
			error: (error) => ({
				message: "更新工作空间共享设置失败。",
				description: getErrorDetail(error),
			}),
		});
	};

	return (
		<>
			{title}
			<OrganizationSettingsPageView
				organization={organization}
				error={error}
				onSubmit={async (values) => {
					const updatedOrganization =
						await updateOrganizationMutation.mutateAsync({
							organizationId: organization.id,
							req: values,
						});
					navigate(`/organizations/${updatedOrganization.name}/settings`);
					toast.success(
						`组织“${updatedOrganization.name}”设置已成功更新。`,
					);
				}}
				onDeleteOrganization={async () => {
					try {
						await deleteOrganizationMutation.mutateAsync(organization.id);
						toast.success(
							`组织“${organization.display_name || organization.name}”已成功删除。`,
						);
						navigate("/organizations");
					} catch (error) {
						toast.error(
							getErrorMessage(
								error,
								`删除组织“${organization.name}”失败。`,
							),
							{
								description: getErrorDetail(error),
							},
						);
					}
				}}
				workspaceSharingGloballyDisabled={
					sharingSettingsQuery.data?.sharing_globally_disabled
				}
				shareableWorkspaceOwners={
					sharingSettingsQuery.data?.shareable_workspace_owners ?? "none"
				}
				onChangeShareableOwners={handleChangeShareableOwners}
				isTogglingWorkspaceSharing={patchSharingSettingsMutation.isPending}
			/>
		</>
	);
};

export default OrganizationSettingsPage;
