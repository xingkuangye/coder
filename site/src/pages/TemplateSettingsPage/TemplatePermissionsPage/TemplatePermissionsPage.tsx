import type { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	setGroupRole,
	setUserRole,
	templateACL,
} from "#/api/queries/templates";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import { useFeatureVisibility } from "#/modules/dashboard/useFeatureVisibility";
import { docs } from "#/utils/docs";
import { pageTitle } from "#/utils/page";
import { useTemplateSettings } from "../TemplateSettingsLayout";
import { TemplatePermissionsPageView } from "./TemplatePermissionsPageView";

const TemplatePermissionsPage: FC = () => {
	const { template, permissions } = useTemplateSettings();
	const { template_rbac: isTemplateRBACEnabled } = useFeatureVisibility();
	const templateACLQuery = useQuery(templateACL(template.id));
	const queryClient = useQueryClient();

	const addUserMutation = useMutation(setUserRole(queryClient));
	const updateUserMutation = useMutation(setUserRole(queryClient));
	const removeUserMutation = useMutation(setUserRole(queryClient));

	const addGroupMutation = useMutation(setGroupRole(queryClient));
	const updateGroupMutation = useMutation(setGroupRole(queryClient));
	const removeGroupMutation = useMutation(setGroupRole(queryClient));

	return (
		<>
			<title>{pageTitle(template.name, "权限")}</title>

			{!isTemplateRBACEnabled ? (
				<PaywallPremium
					message="模板权限"
					description="控制用户和群组对模板的访问权限。您需要 Premium 许可证才能使用此功能。"
					documentationLink={docs("/admin/templates/template-permissions")}
				/>
			) : (
				<TemplatePermissionsPageView
					templateID={template.id}
					templateACL={templateACLQuery.data}
					canUpdatePermissions={Boolean(permissions?.canUpdateTemplate)}
					onAddUser={async (user, role, reset) => {
						await addUserMutation.mutateAsync({
							templateId: template.id,
							userId: user.id,
							role,
						});
						reset();
					}}
					isAddingUser={addUserMutation.isPending}
					onUpdateUser={async (user, role) => {
						await updateUserMutation.mutateAsync(
							{
								templateId: template.id,
								userId: user.id,
								role,
							},
							{
								onSuccess: () => {
									toast.success(
										`用户 "${user.username}" 的角色已成功更新为 "${role}"。`,
									);
								},
								onError: (error) => {
									toast.error(
										getErrorMessage(
											error,
											`更新用户 "${user.username}" 的角色失败。`,
										),
										{
											description: getErrorDetail(error),
										},
									);
								},
							},
						);
					}}
					updatingUserId={
						updateUserMutation.isPending
							? updateUserMutation.variables?.userId
							: undefined
					}
					onRemoveUser={async (user) => {
						await removeUserMutation.mutateAsync(
							{
								templateId: template.id,
								userId: user.id,
								role: "",
							},
							{
								onSuccess: () => {
									toast.success(
										`用户 "${user.username}" 已成功移除。`,
									);
								},
								onError: (error) => {
									toast.error(
										getErrorMessage(
											error,
											`移除用户 "${user.username}" 失败。`,
										),
										{
											description: getErrorDetail(error),
										},
									);
								},
							},
						);
					}}
					onAddGroup={async (group, role, reset) => {
						await addGroupMutation.mutateAsync({
							templateId: template.id,
							groupId: group.id,
							role,
						});
						reset();
					}}
					isAddingGroup={addGroupMutation.isPending}
					onUpdateGroup={async (group, role) => {
						await updateGroupMutation.mutateAsync(
							{
								templateId: template.id,
								groupId: group.id,
								role,
							},
							{
								onSuccess: () => {
									toast.success(
										`群组 "${group.display_name || group.name}" 的角色已成功更新为 "${role}"。`,
									);
								},
								onError: (error) => {
									toast.error(
										getErrorMessage(
											error,
											`更新群组 "${group.display_name || group.name}" 的角色失败。`,
										),
										{
											description: getErrorDetail(error),
										},
									);
								},
							},
						);
					}}
					updatingGroupId={
						updateGroupMutation.isPending
							? updateGroupMutation.variables?.groupId
							: undefined
					}
					onRemoveGroup={async (group) => {
						await removeGroupMutation.mutateAsync(
							{
								groupId: group.id,
								templateId: template.id,
								role: "",
							},
							{
								onSuccess: () => {
									toast.success(
										`群组 "${group.display_name || group.name}" 已成功移除。`,
									);
								},
								onError: (error) => {
									toast.error(
										getErrorMessage(
											error,
											`移除群组 "${group.display_name || group.name}" 失败。`,
										),
										{
											description: getErrorDetail(error),
										},
									);
								},
							},
						);
					}}
				/>
			)}
		</>
	);
};

export default TemplatePermissionsPage;
