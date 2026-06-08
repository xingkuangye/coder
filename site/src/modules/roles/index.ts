import type { SlimRole } from "#/api/typesGenerated";

export type ScopedSlimRole = SlimRole & {
	global?: boolean;
};

export const roleDescriptions: Record<string, string> = {
	owner:
		"拥有者可以管理所有资源，包括用户、组、模板和工作区。",
	"user-admin": "用户管理员可以管理所有用户和组。",
	"template-admin": "模板管理员可以管理所有模板和工作区。",
	auditor: "审计员可以访问审计日志。",
	"agents-access": "授予访问 Coder Agents 聊天的权限。",
	"organization-admin":
		"组织管理员可以管理此组织内的所有资源。",
	"organization-user-admin":
		"组织用户管理员可以管理此组织内的成员和组。",
	"organization-template-admin":
		"组织模板管理员可以管理此组织内的模板和工作区。",
	"organization-auditor":
		"组织审计员可以访问此组织的审计日志。",
	"organization-workspace-creation-ban":
		"禁止此用户在此组织中创建新工作区。",
	member:
		"每个人都是成员。这是所有用户的共享默认角色。",
};

export const memberRole: ScopedSlimRole = {
	name: "member",
	display_name: "成员",
} as const;

export function getRoleNames(roles: readonly SlimRole[]): string[] {
	return roles.map((role) => role.name);
}

export function combineGlobalAndOrgRoles(
	globalRoles: readonly SlimRole[],
	orgRoles: readonly SlimRole[],
): ScopedSlimRole[] {
	return [
		...globalRoles.map((it) => ({ ...it, global: true })),
		...orgRoles.map((it) => ({ ...it, global: false })),
	];
}

const roleNamesByAccessLevel: readonly string[] = [
	"owner",
	"organization-admin",
	"user-admin",
	"organization-user-admin",
	"template-admin",
	"organization-template-admin",
	"auditor",
	"organization-auditor",
	"agents-access",
	"member",
	"organization-member",
];

export function sortRoles<Role extends SlimRole>(
	roles: readonly Role[],
): readonly Role[] {
	if (roles.length < 2) {
		return roles;
	}

	return [...roles].sort((a, b) => {
		const aAccessLevel = roleNamesByAccessLevel.indexOf(a.name);
		const bAccessLevel = roleNamesByAccessLevel.indexOf(b.name);

		// a is not in the access level list, but b is, so b should come first
		if (aAccessLevel === -1 && bAccessLevel !== -1) {
			return 1;
		}
		// b is not in the access level list, but a is, so a should come first
		if (bAccessLevel === -1 && aAccessLevel !== -1) {
			return -1;
		}
		// Neither is in the access level list, so sort them alphabetically
		if (aAccessLevel === -1 && bAccessLevel === -1) {
			return a.name.localeCompare(b.name);
		}
		// Both are in the access level list, so sort them by access level
		return aAccessLevel - bAccessLevel;
	});
}
