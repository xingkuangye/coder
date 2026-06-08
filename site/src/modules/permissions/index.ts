import type { AuthorizationCheck } from "#/api/typesGenerated";
import permissionChecksData from "../../../permissions.json";

export type Permissions = {
	[k in PermissionName]: boolean;
};

type PermissionName = keyof typeof permissionChecks;

/**
 * 站点范围的权限检查，从共享的 permissions.json 加载，
 * 该文件也由 Go 后端使用。
 */
export const permissionChecks =
	permissionChecksData as typeof permissionChecksData &
		Record<string, AuthorizationCheck>;

export const canViewDeploymentSettings = (
	permissions: Permissions | undefined,
): permissions is Permissions => {
	return (
		permissions !== undefined &&
		(permissions.viewDeploymentConfig ||
			permissions.viewAllLicenses ||
			permissions.viewAllUsers ||
			permissions.viewAnyGroup ||
			permissions.viewNotificationTemplate ||
			permissions.viewOrganizationIDPSyncSettings ||
			permissions.viewAnyAIProvider)
	);
};

/**
 * 检查用户是否可以查看或编辑产生给定 OrganizationPermissions 的组织的成员或组。
 */
export const canViewAnyOrganization = (
	permissions: Permissions | undefined,
): permissions is Permissions => {
	return (
		permissions !== undefined &&
		(permissions.viewAnyMembers ||
			permissions.editAnyGroups ||
			permissions.assignAnyRoles ||
			permissions.viewAnyIdpSyncSettings ||
			permissions.editAnySettings)
	);
};
