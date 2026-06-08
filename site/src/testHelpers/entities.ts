import range from "lodash/range";
import {
	type DeploymentConfig,
	type GetLicensesResponse,
	withDefaultFeatures,
} from "#/api/api";
import type { FieldError } from "#/api/errors";
import type * as TypesGen from "#/api/typesGenerated";
import type { ProxyLatencyReport } from "#/contexts/useProxyLatency";
import type { Permissions } from "#/modules/permissions";
import type { OrganizationPermissions } from "#/modules/permissions/organizations";
import type { FileTree } from "#/utils/filetree";
import type { TemplateVersionFiles } from "#/utils/templateVersion";

export const MockOrganization: TypesGen.Organization = {
	id: "my-organization-id",
	name: "my-organization",
	display_name: "我的组织",
	description: "一个用于各种事务的组织。",
	icon: "/emojis/1f957.png",
	created_at: "",
	updated_at: "",
	is_default: false,
	default_org_member_roles: ["organization-workspace-access"],
};

export const MockDefaultOrganization: TypesGen.Organization = {
	...MockOrganization,
	is_default: true,
};

export const MockOrganization2: TypesGen.Organization = {
	id: "my-organization-2-id",
	name: "my-organization-2",
	display_name: "我的组织 2",
	description: "另一个用于各种事务的组织。",
	icon: "/emojis/1f957.png",
	created_at: "",
	updated_at: "",
	is_default: false,
	default_org_member_roles: ["organization-workspace-access"],
};

export const MockOrganization3: TypesGen.Organization = {
	id: "my-organization-3-id",
	name: "my-organization-3",
	display_name: "我的组织 3",
	description:
		"又一个将在 OrganizationPills 中出现的组织。",
	icon: "/emojis/1f957.png",
	created_at: "",
	updated_at: "",
	is_default: false,
	default_org_member_roles: ["organization-workspace-access"],
};

export const MockTemplateDAUResponse: TypesGen.DAUsResponse = {
	tz_hour_offset: 0,
	entries: [
		{ date: "2022-08-27", amount: 1 },
		{ date: "2022-08-29", amount: 2 },
		{ date: "2022-08-30", amount: 1 },
	],
};
export const MockDeploymentDAUResponse: TypesGen.DAUsResponse = {
	tz_hour_offset: 0,
	entries: [
		{ date: "2022-08-27", amount: 10 },
		{ date: "2022-08-29", amount: 22 },
		{ date: "2022-08-30", amount: 14 },
	],
};
export const MockSessionToken: TypesGen.LoginWithPasswordResponse = {
	session_token: "my-session-token",
};

export const MockAPIKey: TypesGen.GenerateAPIKeyResponse = {
	key: "my-api-key",
};

export const MockToken: TypesGen.APIKeyWithOwner = {
	id: "tBoVE3dqLl",
	user_id: "f9ee61d8-1d84-4410-ab6e-c1ec1a641e0b",
	last_used: "0001-01-01T00:00:00Z",
	expires_at: "2023-01-15T20:10:45.637438Z",
	created_at: "2022-12-16T20:10:45.637452Z",
	updated_at: "2022-12-16T20:10:45.637452Z",
	login_type: "token",
	scope: "all",
	scopes: ["coder:all"],
	allow_list: [{ type: "*", id: "*" }],
	lifetime_seconds: 2592000,
	token_name: "token-one",
	username: "admin",
};

export const MockTokens: TypesGen.APIKeyWithOwner[] = [
	MockToken,
	{
		id: "tBoVE3dqLl",
		user_id: "f9ee61d8-1d84-4410-ab6e-c1ec1a641e0b",
		last_used: "0001-01-01T00:00:00Z",
		expires_at: "2023-01-15T20:10:45.637438Z",
		created_at: "2022-12-16T20:10:45.637452Z",
		updated_at: "2022-12-16T20:10:45.637452Z",
		login_type: "token",
		scope: "all",
		scopes: ["coder:all"],
		allow_list: [{ type: "*", id: "*" }],
		lifetime_seconds: 2592000,
		token_name: "token-two",
		username: "admin",
	},
];

export const MockPrimaryWorkspaceProxy: TypesGen.WorkspaceProxy = {
	id: "4aa23000-526a-481f-a007-0f20b98b1e12",
	name: "primary",
	display_name: "默认",
	icon_url: "/emojis/1f60e.png",
	healthy: true,
	path_app_url: "https://coder.com",
	wildcard_hostname: "*.coder.com",
	derp_enabled: true,
	derp_only: false,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	version: "v2.34.5-test+primary",
	deleted: false,
	status: {
		status: "ok",
		checked_at: new Date().toISOString(),
	},
};

export const MockHealthyWildWorkspaceProxy: TypesGen.WorkspaceProxy = {
	id: "5e2c1ab7-479b-41a9-92ce-aa85625de52c",
	name: "haswildcard",
	display_name: "支持子域名",
	icon_url: "/emojis/1f319.png",
	healthy: true,
	path_app_url: "https://external.com",
	wildcard_hostname: "*.external.com",
	derp_enabled: true,
	derp_only: false,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	deleted: false,
	version: "v2.34.5-test+haswildcard",
	status: {
		status: "ok",
		checked_at: new Date().toISOString(),
	},
};

export const MockUnhealthyWildWorkspaceProxy: TypesGen.WorkspaceProxy = {
	id: "8444931c-0247-4171-842a-569d9f9cbadb",
	name: "unhealthy",
	display_name: "不健康",
	icon_url: "/emojis/1f92e.png",
	healthy: false,
	path_app_url: "https://unhealthy.coder.com",
	wildcard_hostname: "*unhealthy..coder.com",
	derp_enabled: true,
	derp_only: true,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	version: "v2.34.5-test+unhealthy",
	deleted: false,
	status: {
		status: "unhealthy",
		report: {
			errors: ["此工作区代理已被手动标记为不健康。"],
			warnings: ["这是针对此工作区代理的手动警告。"],
		},
		checked_at: new Date().toISOString(),
	},
};

export const MockWorkspaceProxies: TypesGen.WorkspaceProxy[] = [
	MockPrimaryWorkspaceProxy,
	MockHealthyWildWorkspaceProxy,
	MockUnhealthyWildWorkspaceProxy,
	{
		id: "26e84c16-db24-4636-a62d-aa1a4232b858",
		name: "nowildcard",
		display_name: "无通配符",
		icon_url: "/emojis/1f920.png",
		healthy: true,
		path_app_url: "https://cowboy.coder.com",
		wildcard_hostname: "",
		derp_enabled: false,
		derp_only: false,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		deleted: false,
		version: "v2.34.5-test+nowildcard",
		status: {
			status: "ok",
			checked_at: new Date().toISOString(),
		},
	},
];

export const MockProxyLatencies: Record<string, ProxyLatencyReport> = {
	...MockWorkspaceProxies.reduce(
		(acc, proxy) => {
			if (!proxy.healthy) {
				return acc;
			}
			acc[proxy.id] = {
				// Make one of them inaccurate.
				accurate: proxy.id !== "26e84c16-db24-4636-a62d-aa1a4232b858",
				// This is a deterministic way to generate a latency to for each proxy.
				// It will be the same for each run as long as the IDs don't change.
				latencyMS:
					(Number(
						Array.from(proxy.id).reduce(
							// Multiply each char code by some large prime number to increase the
							// size of the number and allow use to get some decimal points.
							(acc, char) => acc + char.charCodeAt(0) * 37,
							0,
						),
					) /
						// Cap at 250ms
						100) %
					250,
				at: new Date(),
				nextHopProtocol:
					proxy.id === "8444931c-0247-4171-842a-569d9f9cbadb"
						? "http/1.1"
						: "h2",
			};
			return acc;
		},
		{} as Record<string, ProxyLatencyReport>,
	),
};

export const MockBuildInfo: TypesGen.BuildInfoResponse = {
	agent_api_version: "1.0",
	provisioner_api_version: "1.1",
	external_url: "file:///mock-url",
	version: "v2.99.99",
	dashboard_url: "https:///mock-url",
	workspace_proxy: false,
	upgrade_message: "我的自定义升级消息",
	deployment_id: "510d407f-e521-4180-b559-eab4a6d802b8",
	webpush_public_key: "fake-public-key",
	telemetry: true,
};

export const MockSupportLinks: TypesGen.LinkConfig[] = [
	{
		name: "第一个链接",
		target: "http://first-link",
		icon: "chat",
	},
	{
		name: "第二个链接",
		target: "http://second-link",
		icon: "docs",
	},
	{
		name: "第三个链接",
		target:
			"https://github.com/coder/coder/issues/new?labels=needs+grooming&body={CODER_BUILD_INFO}",
		icon: "",
	},
	{
		name: "第四个链接",
		target: "/icons",
		icon: "",
	},
];

export const MockUpdateCheck: TypesGen.UpdateCheckResponse = {
	current: true,
	url: "file:///mock-url",
	version: "v99.999.9999+c9cdf14",
};

export const MockOwnerRole: TypesGen.Role = {
	name: "owner",
	display_name: "所有者",
	site_permissions: [],
	user_permissions: [],
	organization_id: "",
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockUserAdminRole: TypesGen.Role = {
	name: "user-admin",
	display_name: "用户管理员",
	site_permissions: [],
	user_permissions: [],
	organization_id: "",
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockTemplateAdminRole: TypesGen.Role = {
	name: "template-admin",
	display_name: "模板管理员",
	site_permissions: [],
	user_permissions: [],
	organization_id: "",
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockAuditorRole: TypesGen.Role = {
	name: "auditor",
	display_name: "审计员",
	site_permissions: [],
	user_permissions: [],
	organization_id: "",
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockWorkspaceCreationBanRole: TypesGen.Role = {
	name: "organization-workspace-creation-ban",
	display_name: "组织工作区创建禁令",
	site_permissions: [],
	user_permissions: [],
	organization_id: "",
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockMemberRole: TypesGen.SlimRole = {
	name: "member",
	display_name: "成员",
};

export const MockOrganizationAdminRole: TypesGen.Role = {
	name: "organization-admin",
	display_name: "组织管理员",
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockOrganizationUserAdminRole: TypesGen.Role = {
	name: "organization-user-admin",
	display_name: "组织用户管理员",
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockOrganizationTemplateAdminRole: TypesGen.Role = {
	name: "organization-template-admin",
	display_name: "组织模板管理员",
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockOrganizationAuditorRole: TypesGen.AssignableRoles = {
	name: "organization-auditor",
	display_name: "组织审计员",
	assignable: true,
	built_in: false,
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockAgentsAccessRole: TypesGen.Role = {
	name: "agents-access",
	display_name: "Coder 代理用户",
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [],
	organization_member_permissions: [],
};

export const MockRoleWithOrgPermissions: TypesGen.AssignableRoles = {
	name: "my-role-1",
	display_name: "我的角色 1",
	assignable: true,
	built_in: false,
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [
		{
			negate: false,
			resource_type: "organization_member",
			action: "create",
		},
		{
			negate: false,
			resource_type: "organization_member",
			action: "delete",
		},
		{
			negate: false,
			resource_type: "organization_member",
			action: "read",
		},
		{
			negate: false,
			resource_type: "organization_member",
			action: "update",
		},
		{
			negate: false,
			resource_type: "template",
			action: "create",
		},
		{
			negate: false,
			resource_type: "template",
			action: "delete",
		},
		{
			negate: false,
			resource_type: "template",
			action: "read",
		},
		{
			negate: false,
			resource_type: "template",
			action: "update",
		},
		{
			negate: false,
			resource_type: "template",
			action: "view_insights",
		},
		{
			negate: false,
			resource_type: "audit_log",
			action: "create",
		},
		{
			negate: false,
			resource_type: "audit_log",
			action: "read",
		},
		{
			negate: false,
			resource_type: "group",
			action: "create",
		},
		{
			negate: false,
			resource_type: "group",
			action: "delete",
		},
		{
			negate: false,
			resource_type: "group",
			action: "read",
		},
		{
			negate: false,
			resource_type: "group",
			action: "update",
		},
		{
			negate: false,
			resource_type: "provisioner_daemon",
			action: "create",
		},
	],
	organization_member_permissions: [],
};

export const MockRole2WithOrgPermissions: TypesGen.Role = {
	name: "my-role-1",
	display_name: "我的角色 1",
	site_permissions: [],
	user_permissions: [],
	organization_id: MockOrganization.id,
	organization_permissions: [
		{
			negate: false,
			resource_type: "audit_log",
			action: "create",
		},
	],
	organization_member_permissions: [],
};

// assignableRole takes a role and a boolean. The boolean implies if the
// actor can assign (add/remove) the role from other users.
export function assignableRole(
	role: TypesGen.Role,
	assignable: boolean,
): TypesGen.AssignableRoles {
	return {
		...role,
		assignable: assignable,
		built_in: true,
	};
}

export const MockSiteRoles = [
	MockUserAdminRole,
	MockAuditorRole,
	MockWorkspaceCreationBanRole,
];

export const MockUserOwner: TypesGen.User = {
	id: "test-user",
	username: "TestUser",
	email: "test@coder.com",
	created_at: "",
	updated_at: "",
	status: "active",
	organization_ids: [MockOrganization.id],
	roles: [MockOwnerRole],
	avatar_url: "https://avatars.githubusercontent.com/u/95932066?s=200&v=4",
	last_seen_at: "",
	login_type: "password",
	has_ai_seat: false,
	name: "",
};

export const MockUserMember: TypesGen.User = {
	id: "test-user-2",
	username: "TestUser2",
	email: "test2@coder.com",
	created_at: "",
	updated_at: "",
	status: "active",
	organization_ids: [MockOrganization.id],
	roles: [],
	avatar_url: "",
	last_seen_at: "2022-09-14T19:12:21Z",
	login_type: "oidc",
	has_ai_seat: false,
	name: "Mock 用户第二个",
};

export const SuspendedMockUser: TypesGen.User = {
	id: "suspended-mock-user",
	username: "SuspendedMockUser",
	email: "iamsuspendedsad!@coder.com",
	created_at: "",
	updated_at: "",
	status: "suspended",
	organization_ids: [MockOrganization.id],
	roles: [],
	avatar_url: "",
	last_seen_at: "",
	login_type: "password",
	has_ai_seat: false,
	name: "",
};

export const MockUserAppearanceSettings: TypesGen.UserAppearanceSettings = {
	theme_preference: "dark",
	theme_mode: "single",
	theme_light: "light",
	theme_dark: "dark",
	terminal_font: "",
};

export const MockUserSecrets: TypesGen.UserSecret[] = [
	{
		id: "secret-env-only",
		name: "EXAMPLE_TOKEN",
		description: "用于示例模板。",
		env_name: "EXAMPLE_TOKEN",
		file_path: "",
		created_at: "2026-04-28T16:30:00Z",
		updated_at: "2026-04-30T16:30:00Z",
	},
	{
		id: "secret-file-only",
		name: "config-json",
		description: "作为工作区文件挂载。",
		env_name: "",
		file_path: "~/.config/example/config.json",
		created_at: "2026-04-29T16:30:00Z",
		updated_at: "2026-05-01T16:30:00Z",
	},
	{
		id: "secret-env-and-file",
		name: "SERVICE_API_KEY",
		description: "可作为环境变量和文件使用。",
		env_name: "SERVICE_API_KEY",
		file_path: "/var/run/secrets/service-api-key",
		created_at: "2026-04-30T16:30:00Z",
		updated_at: "2026-05-02T16:30:00Z",
	},
	{
		id: "secret-not-injected",
		name: "SERVICE_PASSWORD",
		description: "",
		env_name: "",
		file_path: "",
		created_at: "2026-05-01T16:30:00Z",
		updated_at: "2026-05-03T16:30:00Z",
	},
	{
		id: "secret-duplicate",
		name: "DUPLICATE_API_KEY",
		description: "用于测试重复值验证。",
		env_name: "DUPLICATE_API_KEY",
		file_path: "",
		created_at: "2026-05-01T18:30:00Z",
		updated_at: "2026-05-03T18:30:00Z",
	},
];

export const MockTasksTabVisible: boolean = false;

export const MockOrganizationMember: TypesGen.OrganizationMemberWithUserData = {
	organization_id: MockOrganization.id,
	user_id: MockUserOwner.id,
	username: MockUserOwner.username,
	email: MockUserOwner.email,
	updated_at: "2025-05-22T17:51:49.49745Z",
	created_at: "2025-05-22T17:51:49.497449Z",
	user_updated_at: MockUserMember.updated_at,
	user_created_at: MockUserMember.created_at,
	last_seen_at: MockUserMember.last_seen_at,
	status: MockUserMember.status,
	login_type: MockUserMember.login_type,
	name: MockUserOwner.name,
	avatar_url: MockUserOwner.avatar_url,
	global_roles: MockUserOwner.roles,
	has_ai_seat: false,
	roles: [],
};

export const MockOrganizationMember2: TypesGen.OrganizationMemberWithUserData =
	{
		organization_id: MockOrganization.id,
		user_id: MockUserMember.id,
		username: MockUserMember.username,
		email: MockUserMember.email,
		updated_at: "2025-05-22T17:51:49.49745Z",
		created_at: "2025-05-22T17:51:49.497449Z",
		user_updated_at: MockUserMember.updated_at,
		user_created_at: MockUserMember.created_at,
		last_seen_at: MockUserMember.last_seen_at,
		status: MockUserMember.status,
		login_type: MockUserMember.login_type,
		name: MockUserMember.name,
		avatar_url: MockUserMember.avatar_url,
		global_roles: MockUserMember.roles,
		has_ai_seat: false,
		roles: [],
	};

export const MockProvisionerKey: TypesGen.ProvisionerKey = {
	id: "test-provisioner-key",
	organization: MockOrganization.id,
	created_at: "2022-05-17T17:39:01.382927298Z",
	name: "test-name",
	tags: { scope: "organization" },
};

const MockProvisionerBuiltinKey: TypesGen.ProvisionerKey = {
	...MockProvisionerKey,
	id: "00000000-0000-0000-0000-000000000001",
	name: "built-in",
};

const MockProvisionerUserAuthKey: TypesGen.ProvisionerKey = {
	...MockProvisionerKey,
	id: "00000000-0000-0000-0000-000000000002",
	name: "user-auth",
};

const MockProvisionerPskKey: TypesGen.ProvisionerKey = {
	...MockProvisionerKey,
	id: "00000000-0000-0000-0000-000000000003",
	name: "psk",
};

export const MockProvisioner: TypesGen.ProvisionerDaemon = {
	created_at: "2022-05-17T17:39:01.382927298Z",
	id: "test-provisioner",
	key_id: MockProvisionerBuiltinKey.id,
	organization_id: MockOrganization.id,
	name: "测试供应者",
	provisioners: ["echo"],
	tags: { scope: "organization" },
	version: MockBuildInfo.version,
	api_version: MockBuildInfo.provisioner_api_version,
	last_seen_at: new Date().toISOString(),
	key_name: "test-provisioner",
	status: "idle",
	current_job: null,
	previous_job: null,
};

const MockUserAuthProvisioner: TypesGen.ProvisionerDaemon = {
	...MockProvisioner,
	id: "test-user-auth-provisioner",
	key_id: MockProvisionerUserAuthKey.id,
	name: `${MockUserOwner.name}的供应者`,
	tags: { scope: "user" },
};

const _MockPskProvisioner: TypesGen.ProvisionerDaemon = {
	...MockProvisioner,
	id: "test-psk-provisioner",
	key_id: MockProvisionerPskKey.id,
	key_name: MockProvisionerPskKey.name,
	name: "测试 psk 供应者",
};

const _MockKeyProvisioner: TypesGen.ProvisionerDaemon = {
	...MockProvisioner,
	id: "test-key-provisioner",
	key_id: MockProvisionerKey.id,
	key_name: MockProvisionerKey.name,
	organization_id: MockProvisionerKey.organization,
	name: "测试密钥供应者",
	tags: MockProvisionerKey.tags,
};

const _MockProvisioner2: TypesGen.ProvisionerDaemon = {
	...MockProvisioner,
	id: "test-provisioner-2",
	name: "测试供应者 2",
	key_id: MockProvisionerKey.id,
	key_name: MockProvisionerKey.name,
};

export const MockUserProvisioner: TypesGen.ProvisionerDaemon = {
	...MockUserAuthProvisioner,
	id: "test-user-provisioner",
	name: "测试用户供应者",
	tags: { scope: "user", owner: "12345678-abcd-1234-abcd-1234567890abcd" },
};

export const MockProvisionerWithTags: TypesGen.ProvisionerDaemon = {
	...MockProvisioner,
	id: "test-provisioner-tags",
	name: "带标签的测试供应者",
	tags: {
		...MockProvisioner.tags,
		都市: "ユタ",
		きっぷ: "yes",
		ちいさい: "no",
	},
};

export const MockProvisionerJob: TypesGen.ProvisionerJob = {
	created_at: "",
	id: "test-provisioner-job",
	status: "succeeded",
	file_id: MockOrganization.id,
	completed_at: "2022-05-17T17:39:01.382927298Z",
	initiator_id: MockUserMember.id,
	tags: {
		scope: "organization",
		owner: "",
		wowzers: "whatatag",
		isCapable: "false",
		department: "engineering",
		dreaming: "true",
	},
	queue_position: 0,
	queue_size: 0,
	input: {
		template_version_id: "test-template-version", // MockTemplateVersion.id
	},
	organization_id: MockOrganization.id,
	type: "template_version_dry_run",
	metadata: {
		workspace_id: "test-workspace",
		template_display_name: "测试模板",
		template_icon: "/icon/code.svg",
		template_id: "test-template",
		template_name: "test-template",
		template_version_name: "test-version",
		workspace_name: "test-workspace",
	},
	logs_overflowed: false,
};

export const MockFailedProvisionerJob: TypesGen.ProvisionerJob = {
	...MockProvisionerJob,
	status: "failed",
};

export const MockCancelingProvisionerJob: TypesGen.ProvisionerJob = {
	...MockProvisionerJob,
	status: "canceling",
};
export const MockCanceledProvisionerJob: TypesGen.ProvisionerJob = {
	...MockProvisionerJob,
	status: "canceled",
};
export const MockRunningProvisionerJob: TypesGen.ProvisionerJob = {
	...MockProvisionerJob,
	status: "running",
};
export const MockPendingProvisionerJob: TypesGen.ProvisionerJob = {
	...MockProvisionerJob,
	status: "pending",
	queue_position: 2,
	queue_size: 4,
};
export const MockTemplateVersion: TypesGen.TemplateVersion = {
	id: "test-template-version",
	created_at: "2022-05-17T17:39:01.382927298Z",
	updated_at: "2022-05-17T17:39:01.382927298Z",
	template_id: "test-template",
	job: MockProvisionerJob,
	name: "test-version",
	message: "第一个版本",
	readme: `---
name:Template test
---
## 指令
你可以在这里添加指令

[一些链接信息](https://coder.com)`,
	created_by: MockUserOwner,
	archived: false,
	has_external_agent: false,
};

export const MockTemplateVersion2: TypesGen.TemplateVersion = {
	id: "test-template-version-2",
	created_at: "2022-05-17T17:39:01.382927298Z",
	updated_at: "2022-05-17T17:39:01.382927298Z",
	template_id: "test-template",
	job: MockProvisionerJob,
	name: "test-version-2",
	message: "第一个版本",
	readme: `---
name:Template test 2
---
## 指令
你可以在这里添加指令

[一些链接信息](https://coder.com)`,
	created_by: MockUserOwner,
	archived: false,
	has_external_agent: false,
};

export const MockTemplateVersionWithMarkdownMessage: TypesGen.TemplateVersion =
	{
		...MockTemplateVersion,
		id: "test-template-version-markdown",
		name: "test-version-markdown",
		message: `
# Abiding Grace
## Enchantment
At the beginning of your end step, choose one —

- You gain 1 life.

- Return target creature card with mana value 1 from your graveyard to the battlefield.
`,
	};

export const MockTemplate: TypesGen.Template = {
	id: "test-template",
	created_at: "2022-05-17T17:39:01.382927298Z",
	updated_at: "2022-05-18T17:39:01.382927298Z",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	organization_icon: "/emojis/1f5fa.png",
	name: "test-template",
	display_name: "测试模板",
	provisioner: MockProvisioner.provisioners[0],
	active_version_id: MockTemplateVersion.id,
	active_user_count: 1,
	build_time_stats: {
		start: {
			P50: 1000,
			P95: 1500,
		},
		stop: {
			P50: 1000,
			P95: 1500,
		},
		delete: {
			P50: 1000,
			P95: 1500,
		},
	},
	description: "这是一个测试描述。",
	default_ttl_ms: 24 * 60 * 60 * 1000,
	activity_bump_ms: 1 * 60 * 60 * 1000,
	autostop_requirement: {
		days_of_week: ["sunday"],
		weeks: 1,
	},
	autostart_requirement: {
		days_of_week: [
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
			"sunday",
		],
	},
	created_by_id: "test-creator-id",
	created_by_name: "test_creator",
	icon: "/icon/code.svg",
	allow_user_cancel_workspace_jobs: true,
	failure_ttl_ms: 0,
	time_til_dormant_ms: 0,
	time_til_dormant_autodelete_ms: 0,
	allow_user_autostart: true,
	allow_user_autostop: true,
	require_active_version: false,
	deprecated: false,
	deprecation_message: "",
	deleted: false,
	max_port_share_level: "public",
	use_classic_parameter_flow: false,
	cors_behavior: "simple",
	disable_module_cache: false,
};

const _MockTemplateVersionFiles: TemplateVersionFiles = {
	"README.md": "# 示例\n\n这是一个示例模板。",
	"main.tf": `// Provides info about the workspace.
data "coder_workspace" "me" {}

// Provides the startup script used to download
// the agent and communicate with Coder.
resource "coder_agent" "dev" {
os = "linux"
arch = "amd64"
}

resource "kubernetes_pod" "main" {
// Ensures that the Pod dies when the workspace shuts down!
count = data.coder_workspace.me.start_count
metadata {
  name      = "dev-\${data.coder_workspace.me.id}"
}
spec {
  container {
    image   = "ubuntu"
    command = ["sh", "-c", coder_agent.main.init_script]
    env {
      name  = "CODER_AGENT_TOKEN"
      value = coder_agent.main.token
    }
  }
}
}
`,
};

export const MockTemplateVersionFileTree: FileTree = {
	"README.md": "# 示例\n\n这是一个示例模板。",
	"main.tf": `// Provides info about the workspace.
data "coder_workspace" "me" {}

// Provides the startup script used to download
// the agent and communicate with Coder.
resource "coder_agent" "dev" {
os = "linux"
arch = "amd64"
}

resource "kubernetes_pod" "main" {
// Ensures that the Pod dies when the workspace shuts down!
count = data.coder_workspace.me.start_count
metadata {
  name      = "dev-\${data.coder_workspace.me.id}"
}
spec {
  container {
    image   = "ubuntu"
    command = ["sh", "-c", coder_agent.main.init_script]
    env {
      name  = "CODER_AGENT_TOKEN"
      value = coder_agent.main.token
    }
  }
}
}
`,
	images: {
		"java.Dockerfile": "FROM eclipse-temurin:17-jdk-jammy",
		"python.Dockerfile": "FROM python:3.8-slim-buster",
	},
};

export const MockWorkspaceApp: TypesGen.WorkspaceApp = {
	id: "test-app",
	slug: "test-app",
	display_name: "测试应用",
	subdomain: false,
	health: "disabled",
	external: false,
	sharing_level: "owner",
	hidden: false,
	open_in: "slim-window",
	statuses: [],
	tooltip: "测试**工具提示**",
};

export const MockWorkspaceAgentLogSource: TypesGen.WorkspaceAgentLogSource = {
	created_at: "2023-05-04T11:30:41.402072Z",
	id: "dc790496-eaec-4f88-a53f-8ce1f61a1fff",
	display_name: "启动脚本",
	icon: "",
	workspace_agent_id: "",
};

const MockWorkspaceAgentScript: TypesGen.WorkspaceAgentScript = {
	id: "08eaca83-1221-4fad-b882-d1136981f54d",
	log_source_id: MockWorkspaceAgentLogSource.id,
	cron: "",
	log_path: "",
	run_on_start: true,
	run_on_stop: false,
	script: "echo 'hello world'",
	start_blocks_login: false,
	timeout: 0,
	display_name: "启动脚本",
};

export const MockWorkspaceAgent: TypesGen.WorkspaceAgent = {
	apps: [MockWorkspaceApp],
	architecture: "amd64",
	created_at: "",
	environment_variables: {},
	id: "test-workspace-agent",
	parent_id: null,
	name: "a-workspace-agent",
	operating_system: "linux",
	resource_id: "",
	status: "connected",
	updated_at: "",
	version: MockBuildInfo.version,
	api_version: MockBuildInfo.agent_api_version,
	latency: {
		"Coder Embedded DERP": {
			latency_ms: 32.55,
			preferred: true,
		},
	},
	connection_timeout_seconds: 120,
	troubleshooting_url: "https://coder.com/troubleshoot",
	lifecycle_state: "ready",
	logs_length: 0,
	logs_overflowed: false,
	log_sources: [MockWorkspaceAgentLogSource],
	scripts: [MockWorkspaceAgentScript],
	startup_script_behavior: "non-blocking",
	subsystems: ["envbox", "exectrace"],
	health: {
		healthy: true,
	},
	display_apps: [
		"ssh_helper",
		"port_forwarding_helper",
		"vscode",
		"vscode_insiders",
		"web_terminal",
	],
};

export const MockWorkspaceSubAgent: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	apps: [],
	id: "test-workspace-sub-agent",
	parent_id: "test-workspace-agent",
	name: "a-workspace-sub-agent",
	log_sources: [],
	scripts: [],
	directory: "/workspace/test",
	display_apps: [
		"ssh_helper",
		"port_forwarding_helper",
		"vscode",
		"vscode_insiders",
		"web_terminal",
	],
};

const MockWorkspaceUnhealthyAgent: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-unhealthy-agent",
	name: "a-workspace-unhealthy-agent",
	status: "timeout",
	lifecycle_state: "start_error",
	health: { healthy: false },
};

export const MockWorkspaceAppStatus: TypesGen.WorkspaceAppStatus = {
	id: "test-app-status",
	created_at: "2022-05-17T17:39:01.382927298Z",
	agent_id: "test-workspace-agent",
	workspace_id: "test-workspace",
	app_id: MockWorkspaceApp.id,
	uri: "https://github.com/coder/coder/pull/1234",
	message: "您的竞争对手页面已完成！",
	state: "complete",
	// Deprecated fields
	needs_user_attention: false,
	icon: "",
};

export const MockWorkspaceAgentDisconnected: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-2",
	name: "another-workspace-agent",
	status: "disconnected",
	version: "",
	latency: {},
	lifecycle_state: "ready",
	health: {
		healthy: false,
		reason: "代理未连接",
	},
};

export const MockWorkspaceAgentOutdated: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-3",
	name: "an-outdated-workspace-agent",
	version: "v99.999.9998+abcdef",
	operating_system: "Windows",
	latency: {
		...MockWorkspaceAgent.latency,
		Chicago: {
			preferred: false,
			latency_ms: 95.11,
		},
		"San Francisco": {
			preferred: false,
			latency_ms: 111.55,
		},
		Paris: {
			preferred: false,
			latency_ms: 221.66,
		},
	},
	lifecycle_state: "ready",
};

export const MockWorkspaceAgentDeprecated: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-3",
	name: "an-outdated-workspace-agent",
	version: "v99.999.9998+abcdef",
	api_version: "1.99",
	operating_system: "Windows",
	latency: {
		...MockWorkspaceAgent.latency,
		Chicago: {
			preferred: false,
			latency_ms: 95.11,
		},
		"San Francisco": {
			preferred: false,
			latency_ms: 111.55,
		},
		Paris: {
			preferred: false,
			latency_ms: 221.66,
		},
	},
	lifecycle_state: "ready",
};

export const MockWorkspaceAgentConnecting: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-connecting",
	name: "another-workspace-agent",
	status: "connecting",
	version: "",
	latency: {},
	lifecycle_state: "created",
};

export const MockWorkspaceAgentTimeout: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-timeout",
	name: "a-timed-out-workspace-agent",
	status: "timeout",
	version: "",
	latency: {},
	lifecycle_state: "created",
	health: {
		healthy: false,
		reason: "代理连接时间过长",
	},
};

export const MockWorkspaceAgentStarting: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-starting",
	name: "a-starting-workspace-agent",
	lifecycle_state: "starting",
};

export const MockWorkspaceAgentReady: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-ready",
	name: "a-ready-workspace-agent",
	lifecycle_state: "ready",
};

export const MockWorkspaceAgentStartTimeout: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-start-timeout",
	name: "a-workspace-agent-timed-out-while-running-startup-script",
	lifecycle_state: "start_timeout",
	scripts: [
		{
			...MockWorkspaceAgentScript,
			status: "timed_out",
		},
	],
	logs_length: 1,
	log_sources: [MockWorkspaceAgentLogSource],
};

export const MockWorkspaceAgentStartError: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-start-error",
	name: "a-workspace-agent-errored-while-running-startup-script",
	lifecycle_state: "start_error",
	health: {
		healthy: false,
		reason: "代理启动脚本失败",
	},
	scripts: [
		{
			...MockWorkspaceAgentScript,
			exit_code: 1,
			status: "exit_failure",
		},
		{
			...MockWorkspaceAgentScript,
			id: "18eaca83-1221-4fad-b882-d1136981f54d",
			log_source_id: "a2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			exit_code: 0,
			status: "ok",
			display_name: "coder",
		},
		{
			...MockWorkspaceAgentScript,
			id: "28eaca83-1221-4fad-b882-d1136981f54d",
			log_source_id: "b2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			status: "timed_out",
			display_name: "time",
		},
		{
			...MockWorkspaceAgentScript,
			id: "38eaca83-1221-4fad-b882-d1136981f54d",
			log_source_id: "c2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			status: "pipes_left_open",
			display_name: "pipe",
		},
		{
			...MockWorkspaceAgentScript,
			id: "48eaca83-1221-4fad-b882-d1136981f54d",
			log_source_id: "d2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			display_name: "running",
		},
	],
	logs_length: 4,
	log_sources: [
		MockWorkspaceAgentLogSource,
		{
			...MockWorkspaceAgentLogSource,
			id: "a2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			display_name: "coder",
			icon: "/icon/coder.svg",
		},
		{
			...MockWorkspaceAgentLogSource,
			id: "b2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			display_name: "time",
			icon: "/icon/folder.svg",
		},
		{
			...MockWorkspaceAgentLogSource,
			id: "c2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			display_name: "pipe",
		},
		{
			...MockWorkspaceAgentLogSource,
			id: "d2ee4b8d-b09d-4f4e-a1f1-5e4adf7d53bb",
			display_name: "running",
		},
	],
};

export const MockWorkspaceAgentShuttingDown: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-shutting-down",
	name: "a-shutting-down-workspace-agent",
	lifecycle_state: "shutting_down",
	health: {
		healthy: false,
		reason: "代理正在关闭",
	},
};

export const MockWorkspaceAgentShutdownTimeout: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-shutdown-timeout",
	name: "a-workspace-agent-timed-out-while-running-shutdownup-script",
	lifecycle_state: "shutdown_timeout",
	health: {
		healthy: false,
		reason: "代理正在关闭",
	},
};

export const MockWorkspaceAgentShutdownError: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-shutdown-error",
	name: "a-workspace-agent-errored-while-running-shutdownup-script",
	lifecycle_state: "shutdown_error",
	health: {
		healthy: false,
		reason: "代理正在关闭",
	},
};

export const MockWorkspaceAgentOff: TypesGen.WorkspaceAgent = {
	...MockWorkspaceAgent,
	id: "test-workspace-agent-off",
	name: "a-workspace-agent-is-shut-down",
	lifecycle_state: "off",
	health: {
		healthy: false,
		reason: "代理正在关闭",
	},
};

export const MockWorkspaceResource: TypesGen.WorkspaceResource = {
	id: "test-workspace-resource",
	name: "a-workspace-resource",
	agents: [MockWorkspaceAgent],
	created_at: "",
	job_id: "",
	type: "google_compute_disk",
	workspace_transition: "start",
	hide: false,
	icon: "",
	metadata: [{ key: "size", value: "32GB", sensitive: false }],
	daily_cost: 10,
};

export const MockWorkspaceResourceSensitive: TypesGen.WorkspaceResource = {
	...MockWorkspaceResource,
	id: "test-workspace-resource-sensitive",
	name: "workspace-resource-sensitive",
	metadata: [{ key: "api_key", value: "12345678", sensitive: true }],
};

export const MockWorkspaceResourceMultipleAgents: TypesGen.WorkspaceResource = {
	...MockWorkspaceResource,
	id: "test-workspace-resource-multiple-agents",
	name: "workspace-resource-multiple-agents",
	agents: [
		MockWorkspaceAgent,
		MockWorkspaceAgentDisconnected,
		MockWorkspaceAgentOutdated,
	],
};

const _MockWorkspaceResourceHidden: TypesGen.WorkspaceResource = {
	...MockWorkspaceResource,
	id: "test-workspace-resource-hidden",
	name: "workspace-resource-hidden",
	hide: true,
};

export const MockWorkspaceVolumeResource: TypesGen.WorkspaceResource = {
	id: "test-workspace-volume-resource",
	created_at: "",
	job_id: "",
	workspace_transition: "start",
	type: "docker_volume",
	name: "home_volume",
	hide: false,
	icon: "",
	daily_cost: 0,
};

export const MockWorkspaceImageResource: TypesGen.WorkspaceResource = {
	id: "test-workspace-image-resource",
	created_at: "",
	job_id: "",
	workspace_transition: "start",
	type: "docker_image",
	name: "main",
	hide: false,
	icon: "",
	daily_cost: 0,
};

export const MockWorkspaceContainerResource: TypesGen.WorkspaceResource = {
	id: "test-workspace-container-resource",
	created_at: "",
	job_id: "",
	workspace_transition: "start",
	type: "docker_container",
	name: "workspace",
	hide: false,
	icon: "",
	daily_cost: 0,
};

const _MockWorkspaceAutostartDisabled: TypesGen.UpdateWorkspaceAutostartRequest =
	{
		schedule: "",
	};

const MockWorkspaceAutostartEnabled: TypesGen.UpdateWorkspaceAutostartRequest =
	{
		// Runs at 9:30am Monday through Friday using Canada/Eastern
		// (America/Toronto) time
		schedule: "CRON_TZ=Canada/Eastern 30 9 * * 1-5",
	};

export const MockWorkspaceBuild: TypesGen.WorkspaceBuild = {
	build_number: 1,
	created_at: "2022-05-17T17:39:01.382927298Z",
	id: "1",
	initiator_id: MockUserOwner.id,
	initiator_name: MockUserOwner.username,
	job: MockProvisionerJob,
	template_version_id: MockTemplateVersion.id,
	template_version_name: MockTemplateVersion.name,
	transition: "start",
	updated_at: "2022-05-17T17:39:01.382927298Z",
	workspace_name: "test-workspace",
	workspace_owner_id: MockUserOwner.id,
	workspace_owner_name: MockUserOwner.username,
	workspace_owner_avatar_url: MockUserOwner.avatar_url,
	workspace_id: "759f1d46-3174-453d-aa60-980a9c1442f3",
	deadline: "2022-05-17T23:39:00.00Z",
	reason: "initiator",
	resources: [MockWorkspaceResource],
	status: "running",
	daily_cost: 20,
	matched_provisioners: {
		count: 1,
		available: 1,
	},
	template_version_preset_id: null,
};

const MockWorkspaceBuildAutostart: TypesGen.WorkspaceBuild = {
	build_number: 1,
	created_at: "2022-05-17T17:39:01.382927298Z",
	id: "1",
	initiator_id: MockUserOwner.id,
	initiator_name: MockUserOwner.username,
	job: MockProvisionerJob,
	template_version_id: MockTemplateVersion.id,
	template_version_name: MockTemplateVersion.name,
	transition: "start",
	updated_at: "2022-05-17T17:39:01.382927298Z",
	workspace_name: "test-workspace",
	workspace_owner_id: MockUserOwner.id,
	workspace_owner_name: MockUserOwner.username,
	workspace_owner_avatar_url: MockUserOwner.avatar_url,
	workspace_id: "759f1d46-3174-453d-aa60-980a9c1442f3",
	deadline: "2022-05-17T23:39:00.00Z",
	reason: "autostart",
	resources: [MockWorkspaceResource],
	status: "running",
	daily_cost: 20,
	template_version_preset_id: null,
};

const MockWorkspaceBuildAutostop: TypesGen.WorkspaceBuild = {
	build_number: 1,
	created_at: "2022-05-17T17:39:01.382927298Z",
	id: "1",
	initiator_id: MockUserOwner.id,
	initiator_name: MockUserOwner.username,
	job: MockProvisionerJob,
	template_version_id: MockTemplateVersion.id,
	template_version_name: MockTemplateVersion.name,
	transition: "start",
	updated_at: "2022-05-17T17:39:01.382927298Z",
	workspace_name: "test-workspace",
	workspace_owner_id: MockUserOwner.id,
	workspace_owner_name: MockUserOwner.username,
	workspace_owner_avatar_url: MockUserOwner.avatar_url,
	workspace_id: "759f1d46-3174-453d-aa60-980a9c1442f3",
	deadline: "2022-05-17T23:39:00.00Z",
	reason: "autostop",
	resources: [MockWorkspaceResource],
	status: "running",
	daily_cost: 20,
	template_version_preset_id: null,
};

export const MockFailedWorkspaceBuild = (
	transition: TypesGen.WorkspaceTransition = "start",
): TypesGen.WorkspaceBuild => ({
	build_number: 1,
	created_at: "2022-05-17T17:39:01.382927298Z",
	id: "1",
	initiator_id: MockUserOwner.id,
	initiator_name: MockUserOwner.username,
	job: MockFailedProvisionerJob,
	template_version_id: MockTemplateVersion.id,
	template_version_name: MockTemplateVersion.name,
	transition: transition,
	updated_at: "2022-05-17T17:39:01.382927298Z",
	workspace_name: "test-workspace",
	workspace_owner_id: MockUserOwner.id,
	workspace_owner_name: MockUserOwner.username,
	workspace_owner_avatar_url: MockUserOwner.avatar_url,
	workspace_id: "759f1d46-3174-453d-aa60-980a9c1442f3",
	deadline: "2022-05-17T23:39:00.00Z",
	reason: "initiator",
	resources: [],
	status: "failed",
	daily_cost: 20,
	template_version_preset_id: null,
});

export const MockWorkspaceBuildStop: TypesGen.WorkspaceBuild = {
	...MockWorkspaceBuild,
	id: "2",
	transition: "stop",
};

export const MockWorkspaceBuildDelete: TypesGen.WorkspaceBuild = {
	...MockWorkspaceBuild,
	id: "3",
	transition: "delete",
};

export const MockBuilds = [
	{ ...MockWorkspaceBuild, id: "1" },
	{ ...MockWorkspaceBuildAutostart, id: "2" },
	{ ...MockWorkspaceBuildAutostop, id: "3" },
	{ ...MockWorkspaceBuildStop, id: "4" },
	{ ...MockWorkspaceBuildDelete, id: "5" },
];

export const MockWorkspace: TypesGen.Workspace = {
	id: "test-workspace",
	name: "test-workspace",
	created_at: "",
	updated_at: "",
	template_id: MockTemplate.id,
	template_name: MockTemplate.name,
	template_icon: MockTemplate.icon,
	template_display_name: MockTemplate.display_name,
	template_allow_user_cancel_workspace_jobs:
		MockTemplate.allow_user_cancel_workspace_jobs,
	template_active_version_id: MockTemplate.active_version_id,
	template_require_active_version: MockTemplate.require_active_version,
	template_use_classic_parameter_flow: true,
	outdated: false,
	owner_id: MockUserOwner.id,
	organization_id: MockOrganization.id,
	organization_name: "default",
	owner_name: MockUserOwner.username,
	owner_avatar_url: "https://avatars.githubusercontent.com/u/7122116?v=4",
	autostart_schedule: MockWorkspaceAutostartEnabled.schedule,
	ttl_ms: 2 * 60 * 60 * 1000,
	latest_build: MockWorkspaceBuild,
	last_used_at: "2022-05-16T15:29:10.302441433Z",
	health: {
		healthy: true,
		failing_agents: [],
	},
	latest_app_status: null,
	automatic_updates: "never",
	allow_renames: true,
	favorite: false,
	deleting_at: null,
	dormant_at: null,
	next_start_at: null,
	is_prebuild: false,
	shared_with: [],
};

export const MockPrebuiltWorkspace = {
	...MockWorkspace,
	owner_name: "prebuilds",
	name: "prebuilt-workspace",
	is_prebuild: true,
};

export const MockFavoriteWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-favorite-workspace",
	favorite: true,
};

export const MockStoppedWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-stopped-workspace",
	latest_build: {
		...MockWorkspaceBuildStop,
		status: "stopped",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentOff],
			},
		],
	},
};
export const MockStoppingWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-stopping-workspace",
	latest_build: {
		...MockWorkspaceBuildStop,
		job: MockRunningProvisionerJob,
		status: "stopping",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentShuttingDown],
			},
		],
	},
};
export const MockUnhealthyWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-unhealthy-workspace",
	health: {
		healthy: false,
		failing_agents: [MockWorkspaceUnhealthyAgent.id],
	},
	latest_build: {
		...MockWorkspace.latest_build,
		resources: [
			{ ...MockWorkspaceResource, agents: [MockWorkspaceUnhealthyAgent] },
		],
	},
};
export const MockStartingWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-starting-workspace",
	latest_build: {
		...MockWorkspaceBuild,
		job: MockRunningProvisionerJob,
		transition: "start",
		status: "starting",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentStarting],
			},
		],
	},
};
export const MockCancelingWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-canceling-workspace",
	latest_build: {
		...MockWorkspaceBuild,
		job: MockCancelingProvisionerJob,
		status: "canceling",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentShuttingDown],
			},
		],
	},
};
export const MockCanceledWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-canceled-workspace",
	latest_build: {
		...MockWorkspaceBuild,
		job: MockCanceledProvisionerJob,
		status: "canceled",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentOff],
			},
		],
	},
};
export const MockFailedWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-failed-workspace",
	latest_build: {
		...MockWorkspaceBuild,
		job: MockFailedProvisionerJob,
		status: "failed",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentStartError],
			},
		],
	},
};
export const MockDeletingWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-deleting-workspace",
	latest_build: {
		...MockWorkspaceBuildDelete,
		job: MockRunningProvisionerJob,
		status: "deleting",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentShuttingDown],
			},
		],
	},
};

const MockWorkspaceWithDeletion = {
	...MockStoppedWorkspace,
	deleting_at: new Date().toISOString(),
};

export const MockDeletedWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-deleted-workspace",
	latest_build: {
		...MockWorkspaceBuildDelete,
		status: "deleted",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentOff],
			},
		],
	},
};

export const MockOutdatedWorkspace: TypesGen.Workspace = {
	...MockFailedWorkspace,
	id: "test-outdated-workspace",
	outdated: true,
};

export const MockRunningOutdatedWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-running-outdated-workspace",
	outdated: true,
};

export const MockDormantWorkspace: TypesGen.Workspace = {
	...MockStoppedWorkspace,
	id: "test-dormant-workspace",
	dormant_at: new Date().toISOString(),
};

export const MockDormantOutdatedWorkspace: TypesGen.Workspace = {
	...MockStoppedWorkspace,
	id: "test-dormant-outdated-workspace",
	name: "Dormant-Workspace",
	outdated: true,
	dormant_at: new Date().toISOString(),
};

const MockOutdatedRunningWorkspaceRequireActiveVersion: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-outdated-workspace-require-active-version",
	outdated: true,
	template_require_active_version: true,
};

const MockOutdatedRunningWorkspaceAlwaysUpdate: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-outdated-workspace-always-update",
	outdated: true,
	automatic_updates: "always",
	latest_build: {
		...MockWorkspaceBuild,
		status: "running",
	},
};

export const MockOutdatedStoppedWorkspaceRequireActiveVersion: TypesGen.Workspace =
	{
		...MockOutdatedRunningWorkspaceRequireActiveVersion,
		latest_build: {
			...MockWorkspaceBuild,
			status: "stopped",
		},
	};

const _MockOutdatedStoppedWorkspaceAlwaysUpdate: TypesGen.Workspace = {
	...MockOutdatedRunningWorkspaceAlwaysUpdate,
	latest_build: {
		...MockWorkspaceBuild,
		status: "stopped",
	},
};

export const MockPendingWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-pending-workspace",
	latest_build: {
		...MockWorkspaceBuild,
		job: MockPendingProvisionerJob,
		transition: "start",
		status: "pending",
		resources: [
			{
				...MockWorkspaceResource,
				agents: [MockWorkspaceAgentConnecting],
			},
		],
	},
};

export const MockNonClassicParameterFlowWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	id: "test-non-classic-parameter-flow-workspace",
	template_use_classic_parameter_flow: false,
};

// just over one page of workspaces
export const MockWorkspacesResponse: TypesGen.WorkspacesResponse = {
	workspaces: range(1, 27).map((id: number) => ({
		...MockWorkspace,
		id: id.toString(),
		name: `${MockWorkspace.name}${id}`,
	})),
	count: 26,
};

const _MockWorkspacesResponseWithDeletions = {
	workspaces: [...MockWorkspacesResponse.workspaces, MockWorkspaceWithDeletion],
	count: MockWorkspacesResponse.count + 1,
};

export const MockTemplateVersionParameter1: TypesGen.TemplateVersionParameter =
	{
		name: "first_parameter",
		type: "string",
		form_type: "input",
		description: "这是第一个参数",
		description_plaintext: "Markdown: 这是第一个参数",
		default_value: "abc",
		mutable: true,
		icon: "/icon/folder.svg",
		options: [],
		required: true,
		ephemeral: false,
	};

export const MockTemplateVersionParameter2: TypesGen.TemplateVersionParameter =
	{
		name: "second_parameter",
		type: "number",
		form_type: "input",
		description: "这是第二个参数",
		description_plaintext: "Markdown: 这是第二个参数",
		default_value: "2",
		mutable: true,
		icon: "/icon/folder.svg",
		options: [],
		validation_min: 1,
		validation_max: 3,
		validation_monotonic: "increasing",
		required: true,
		ephemeral: false,
	};

export const MockTemplateVersionParameter3: TypesGen.TemplateVersionParameter =
	{
		name: "third_parameter",
		type: "string",
		form_type: "input",
		description: "这是第三个参数",
		description_plaintext: "Markdown: 这是第三个参数",
		default_value: "aaa",
		mutable: true,
		icon: "/icon/database.svg",
		options: [],
		validation_error: "不行！",
		validation_regex: "^[a-z]{3}$",
		required: true,
		ephemeral: false,
	};

export const MockTemplateVersionParameter4: TypesGen.TemplateVersionParameter =
	{
		name: "fourth_parameter",
		type: "string",
		form_type: "input",
		description: "这是第四个参数",
		description_plaintext: "Markdown: 这是第四个参数",
		default_value: "def",
		mutable: false,
		icon: "/icon/database.svg",
		options: [],
		required: true,
		ephemeral: false,
	};

const MockTemplateVersionParameter5: TypesGen.TemplateVersionParameter = {
	name: "fifth_parameter",
	type: "number",
	form_type: "input",
	description: "这是第五个参数",
	description_plaintext: "Markdown: 这是第五个参数",
	default_value: "5",
	mutable: true,
	icon: "/icon/folder.svg",
	options: [],
	validation_min: 1,
	validation_max: 10,
	validation_monotonic: "decreasing",
	required: true,
	ephemeral: false,
};

export const MockTemplateVersionParameter6: TypesGen.TemplateVersionParameter =
	{
		name: "ephemeral_parameter",
		type: "string",
		form_type: "input",
		description: "这是一个短暂参数",
		description_plaintext: "Markdown: 这是一个短暂参数",
		default_value: "abc",
		mutable: true,
		icon: "/icon/folder.svg",
		options: [],
		required: true,
		ephemeral: true,
	};

export const MockTemplateVersionVariable1: TypesGen.TemplateVersionVariable = {
	name: "first_variable",
	description: "这是第一个变量。",
	type: "string",
	value: "",
	default_value: "abc",
	required: false,
	sensitive: false,
};

export const MockTemplateVersionVariable2: TypesGen.TemplateVersionVariable = {
	name: "second_variable",
	description: "这是第二个变量。",
	type: "number",
	value: "5",
	default_value: "3",
	required: false,
	sensitive: false,
};

export const MockTemplateVersionVariable3: TypesGen.TemplateVersionVariable = {
	name: "third_variable",
	description: "这是第三个变量。",
	type: "bool",
	value: "",
	default_value: "false",
	required: false,
	sensitive: false,
};

export const MockTemplateVersionVariable4: TypesGen.TemplateVersionVariable = {
	name: "fourth_variable",
	description: "这是第四个变量。",
	type: "string",
	value: "defghijk",
	default_value: "",
	required: true,
	sensitive: true,
};

export const MockTemplateVersionVariable5: TypesGen.TemplateVersionVariable = {
	name: "fifth_variable",
	description: "这是第五个变量。",
	type: "string",
	value: "",
	default_value: "",
	required: true,
	sensitive: false,
};

export const MockAuthMethodsPasswordOnly: TypesGen.AuthMethods = {
	password: { enabled: true },
	github: { enabled: false, default_provider_configured: true },
	oidc: { enabled: false, signInText: "", iconUrl: "" },
};

export const MockAuthMethodsPasswordTermsOfService: TypesGen.AuthMethods = {
	terms_of_service_url: "https://www.youtube.com/watch?v=C2f37Vb2NAE",
	password: { enabled: true },
	github: { enabled: false, default_provider_configured: true },
	oidc: { enabled: false, signInText: "", iconUrl: "" },
};

export const MockAuthMethodsExternal: TypesGen.AuthMethods = {
	password: { enabled: false },
	github: { enabled: true, default_provider_configured: true },
	oidc: {
		enabled: true,
		signInText: "Google",
		iconUrl: "/icon/google.svg",
	},
};

export const MockAuthMethodsAll: TypesGen.AuthMethods = {
	password: { enabled: true },
	github: { enabled: true, default_provider_configured: true },
	oidc: {
		enabled: true,
		signInText: "Google",
		iconUrl: "/icon/google.svg",
	},
};

export const MockGitSSHKey: TypesGen.GitSSHKey = {
	user_id: "1fa0200f-7331-4524-a364-35770666caa7",
	created_at: "2022-05-16T14:30:34.148205897Z",
	updated_at: "2022-05-16T15:29:10.302441433Z",
	public_key:
		"ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFJOQRIM7kE30rOzrfy+/+R+nQGCk7S9pioihy+2ARbq",
};

export const MockWorkspaceBuildLogs: TypesGen.ProvisionerJobLog[] = [
	{
		id: 1,
		created_at: "2022-05-19T16:45:31.005Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在设置",
		output: "",
	},
	{
		id: 2,
		created_at: "2022-05-19T16:45:31.006Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在启动工作区",
		output: "",
	},
	{
		id: 3,
		created_at: "2022-05-19T16:45:31.072Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "",
	},
	{
		id: 4,
		created_at: "2022-05-19T16:45:31.073Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "初始化后端...",
	},
	{
		id: 5,
		created_at: "2022-05-19T16:45:31.077Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "",
	},
	{
		id: 6,
		created_at: "2022-05-19T16:45:31.078Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "初始化提供程序插件...",
	},
	{
		id: 7,
		created_at: "2022-05-19T16:45:31.078Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: '- 正在查找 hashicorp/google 版本 "~\u003e 4.15"...',
	},
	{
		id: 8,
		created_at: "2022-05-19T16:45:31.123Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: '- 正在查找 coder/coder 版本 "0.3.4"...',
	},
	{
		id: 9,
		created_at: "2022-05-19T16:45:31.137Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "- 从共享缓存目录使用 hashicorp/google v4.21.0",
	},
	{
		id: 10,
		created_at: "2022-05-19T16:45:31.344Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "- 从共享缓存目录使用 coder/coder v0.3.4",
	},
	{
		id: 11,
		created_at: "2022-05-19T16:45:31.388Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "",
	},
	{
		id: 12,
		created_at: "2022-05-19T16:45:31.388Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output:
			"Terraform 已创建锁文件 .terraform.lock.hcl 以记录提供程序",
	},
	{
		id: 13,
		created_at: "2022-05-19T16:45:31.389Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output:
			"所做的选择。请将此文件包含在你的版本控制仓库中",
	},
	{
		id: 14,
		created_at: "2022-05-19T16:45:31.389Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output:
			"以便 Terraform 可以在将来默认做出相同的选择，当你",
	},
	{
		id: 15,
		created_at: "2022-05-19T16:45:31.39Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: '运行 "terraform init" 时。',
	},
	{
		id: 16,
		created_at: "2022-05-19T16:45:31.39Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "",
	},
	{
		id: 17,
		created_at: "2022-05-19T16:45:31.391Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在启动工作区",
		output: "Terraform 已成功初始化！",
	},
	{
		id: 18,
		created_at: "2022-05-19T16:45:31.42Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "Terraform 1.1.9",
	},
	{
		id: 19,
		created_at: "2022-05-19T16:45:33.537Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "coder_agent.dev: 计划创建",
	},
	{
		id: 20,
		created_at: "2022-05-19T16:45:33.537Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_disk.root: 计划创建",
	},
	{
		id: 21,
		created_at: "2022-05-19T16:45:33.538Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_instance.dev[0]: 计划创建",
	},
	{
		id: 22,
		created_at: "2022-05-19T16:45:33.539Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "计划: 3 个添加, 0 个更改, 0 个销毁。",
	},
	{
		id: 23,
		created_at: "2022-05-19T16:45:33.712Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "coder_agent.dev: 正在创建...",
	},
	{
		id: 24,
		created_at: "2022-05-19T16:45:33.719Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output:
			"coder_agent.dev: 0 秒后创建完成 [id=d07f5bdc-4a8d-4919-9cdb-0ac6ba9e64d6]",
	},
	{
		id: 25,
		created_at: "2022-05-19T16:45:34.139Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_disk.root: 正在创建...",
	},
	{
		id: 26,
		created_at: "2022-05-19T16:45:44.14Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_disk.root: 仍在创建... [10 秒已过去]",
	},
	{
		id: 27,
		created_at: "2022-05-19T16:45:47.106Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output:
			"google_compute_disk.root: 13 秒后创建完成 [id=projects/bruno-coder-v2/zones/europe-west4-b/disks/coder-developer-bruno-dev-123-root]",
	},
	{
		id: 28,
		created_at: "2022-05-19T16:45:47.118Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_instance.dev[0]: 正在创建...",
	},
	{
		id: 29,
		created_at: "2022-05-19T16:45:57.122Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "google_compute_instance.dev[0]: 仍在创建... [10 秒已过去]",
	},
	{
		id: 30,
		created_at: "2022-05-19T16:46:00.837Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output:
			"google_compute_instance.dev[0]: 14 秒后创建完成 [id=projects/bruno-coder-v2/zones/europe-west4-b/instances/coder-developer-bruno-dev-123]",
	},
	{
		id: 31,
		created_at: "2022-05-19T16:46:00.846Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "应用完成！资源：已创建 3 个，已更改 0 个，已销毁 0 个。",
	},
	{
		id: 32,
		created_at: "2022-05-19T16:46:00.847Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在启动工作区",
		output: "输出: 0",
	},
	{
		id: 33,
		created_at: "2022-05-19T16:46:02.283Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在清理",
		output: "",
	},
];

export const MockWorkspaceExtendedBuildLogs: TypesGen.ProvisionerJobLog[] = [
	{
		id: 938494,
		created_at: "2023-08-25T19:07:43.331Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在设置",
		output: "",
	},
	{
		id: 938495,
		created_at: "2023-08-25T19:07:43.331Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在解析模板参数",
		output: "",
	},
	{
		id: 938496,
		created_at: "2023-08-25T19:07:43.339Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在检测持久资源",
		output: "",
	},
	{
		id: 938497,
		created_at: "2023-08-25T19:07:44.15Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "初始化后端...",
	},
	{
		id: 938498,
		created_at: "2023-08-25T19:07:44.215Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "初始化提供程序插件...",
	},
	{
		id: 938499,
		created_at: "2023-08-25T19:07:44.216Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: '- 正在查找 coder/coder 版本 "~> 0.11.0"...',
	},
	{
		id: 938500,
		created_at: "2023-08-25T19:07:44.668Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: '- 正在查找 kreuzwerker/docker 版本 "~> 3.0.1"...',
	},
	{
		id: 938501,
		created_at: "2023-08-25T19:07:44.722Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "- 从共享缓存目录使用 coder/coder v0.11.1",
	},
	{
		id: 938502,
		created_at: "2023-08-25T19:07:44.857Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "- 从共享缓存目录使用 kreuzwerker/docker v3.0.2",
	},
	{
		id: 938503,
		created_at: "2023-08-25T19:07:45.081Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"Terraform 已创建锁文件 .terraform.lock.hcl 以记录提供程序",
	},
	{
		id: 938504,
		created_at: "2023-08-25T19:07:45.081Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"所做的选择。请将此文件包含在你的版本控制仓库中",
	},
	{
		id: 938505,
		created_at: "2023-08-25T19:07:45.081Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"以便 Terraform 可以在将来默认做出相同的选择，当你",
	},
	{
		id: 938506,
		created_at: "2023-08-25T19:07:45.082Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: '运行 "terraform init" 时。',
	},
	{
		id: 938507,
		created_at: "2023-08-25T19:07:45.083Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "Terraform 已成功初始化！",
	},
	{
		id: 938508,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			'你现在可以开始使用 Terraform。尝试运行 "terraform plan" 来查看',
	},
	{
		id: 938509,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"你的基础设施需要的任何更改。所有 Terraform 命令",
	},
	{
		id: 938510,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "应该现在就能正常工作。",
	},
	{
		id: 938511,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"如果你以后设置或更改了 Terraform 的模块或后端配置，",
	},
	{
		id: 938512,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output:
			"请重新运行此命令以重新初始化你的工作目录。如果忘记，其他",
	},
	{
		id: 938513,
		created_at: "2023-08-25T19:07:45.084Z",
		log_source: "provisioner",
		log_level: "debug",
		stage: "正在检测持久资源",
		output: "命令会检测到并提醒你这样做。",
	},
	{
		id: 938514,
		created_at: "2023-08-25T19:07:45.143Z",
		log_source: "provisioner",
		log_level: "info",
		stage: "正在检测持久资源",
		output: "Terraform 1.1.9",
	},
	{
		id: 938515,
		created_at: "2023-08-25T19:07:46.297Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "警告: 参数已弃用",
	},
	{
		id: 938516,
		created_at: "2023-08-25T19:07:46.297Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: '在 devcontainer-on-docker.tf 的第 15 行, 位于 provider "coder":',
	},
	{
		id: 938517,
		created_at: "2023-08-25T19:07:46.297Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "  15:   feature_use_managed_variables = true",
	},
	{
		id: 938518,
		created_at: "2023-08-25T19:07:46.297Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "",
	},
	{
		id: 938519,
		created_at: "2023-08-25T19:07:46.297Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output:
			"在移除对旧版参数的支持后，Terraform 变量现在专门用于模板范围的变量。",
	},
	{
		id: 938520,
		created_at: "2023-08-25T19:07:46.3Z",
		log_source: "provisioner",
		log_level: "error",
		stage: "正在检测持久资源",
		output: "错误: 短暂参数需要默认属性",
	},
	{
		id: 938521,
		created_at: "2023-08-25T19:07:46.3Z",
		log_source: "provisioner",
		log_level: "error",
		stage: "正在检测持久资源",
		output:
			'在 devcontainer-on-docker.tf 的第 27 行, 位于 data "coder_parameter" "another_one":',
	},
	{
		id: 938522,
		created_at: "2023-08-25T19:07:46.3Z",
		log_source: "provisioner",
		log_level: "error",
		stage: "正在检测持久资源",
		output: '  27: data "coder_parameter" "another_one" {',
	},
	{
		id: 938523,
		created_at: "2023-08-25T19:07:46.301Z",
		log_source: "provisioner",
		log_level: "error",
		stage: "正在检测持久资源",
		output: "",
	},
	{
		id: 938524,
		created_at: "2023-08-25T19:07:46.301Z",
		log_source: "provisioner",
		log_level: "error",
		stage: "正在检测持久资源",
		output: "",
	},
	{
		id: 938525,
		created_at: "2023-08-25T19:07:46.303Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "警告: 参数已弃用",
	},
	{
		id: 938526,
		created_at: "2023-08-25T19:07:46.303Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: '在 devcontainer-on-docker.tf 的第 15 行, 位于 provider "coder":',
	},
	{
		id: 938527,
		created_at: "2023-08-25T19:07:46.303Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "  15:   feature_use_managed_variables = true",
	},
	{
		id: 938528,
		created_at: "2023-08-25T19:07:46.303Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output: "",
	},
	{
		id: 938529,
		created_at: "2023-08-25T19:07:46.303Z",
		log_source: "provisioner",
		log_level: "warn",
		stage: "正在检测持久资源",
		output:
			"在移除对旧版参数的支持后，Terraform 变量现在专门用于模板范围的变量。",
	},
	{
		id: 938530,
		created_at: "2023-08-25T19:07:46.311Z",
		log_source: "provisioner_daemon",
		log_level: "info",
		stage: "正在清理",
		output: "",
	},
];

export const MockCancellationMessage = {
	message: "任务已成功取消",
};

type MockAPIInput = {
	message?: string;
	detail?: string;
	validations?: FieldError[];
};

type MockAPIOutput = {
	isAxiosError: true;
	response: {
		data: {
			message: string;
			detail: string | undefined;
			validations: FieldError[] | undefined;
		};
	};
};

export const mockApiError = ({
	message = "出了点问题。",
	detail,
	validations,
}: MockAPIInput): MockAPIOutput => ({
	// This is how axios can check if it is an axios error when calling isAxiosError
	isAxiosError: true,
	response: {
		data: {
			message,
			detail,
			validations,
		},
	},
});

export const MockEntitlements: TypesGen.Entitlements = {
	errors: [],
	warnings: [],
	has_license: false,
	features: withDefaultFeatures({
		workspace_batch_actions: {
			enabled: true,
			entitlement: "entitled",
		},
		task_batch_actions: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
	require_telemetry: false,
	trial: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
};

const _MockEntitlementsWithWarnings: TypesGen.Entitlements = {
	errors: [],
	warnings: ["您已超出活动用户限制。", "还有另一件事。"],
	has_license: true,
	trial: false,
	require_telemetry: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
	features: withDefaultFeatures({
		user_limit: {
			enabled: true,
			entitlement: "grace_period",
			limit: 100,
			actual: 102,
		},
		audit_log: {
			enabled: true,
			entitlement: "entitled",
		},
		browser_only: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
};

export const MockEntitlementsWithAuditLog: TypesGen.Entitlements = {
	errors: [],
	warnings: [],
	has_license: true,
	require_telemetry: false,
	trial: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
	features: withDefaultFeatures({
		audit_log: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
};

export const MockEntitlementsWithConnectionLog: TypesGen.Entitlements = {
	errors: [],
	warnings: [],
	has_license: true,
	require_telemetry: false,
	trial: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
	features: withDefaultFeatures({
		connection_log: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
};

export const MockEntitlementsWithScheduling: TypesGen.Entitlements = {
	errors: [],
	warnings: [],
	has_license: true,
	require_telemetry: false,
	trial: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
	features: withDefaultFeatures({
		advanced_template_scheduling: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
};

const _MockEntitlementsWithUserLimit: TypesGen.Entitlements = {
	errors: [],
	warnings: [],
	has_license: true,
	require_telemetry: false,
	trial: false,
	refreshed_at: "2022-05-20T16:45:57.122Z",
	features: withDefaultFeatures({
		user_limit: {
			enabled: true,
			entitlement: "entitled",
			limit: 25,
		},
	}),
};

export const MockEntitlementsWithMultiOrg: TypesGen.Entitlements = {
	...MockEntitlements,
	has_license: true,
	features: withDefaultFeatures({
		multiple_organizations: {
			enabled: true,
			entitlement: "entitled",
		},
	}),
};

export const MockExperiments: TypesGen.Experiment[] = [];

/**
 * MockOrganization 的审计日志。
 */
export const MockAuditLog: TypesGen.AuditLog = {
	id: "fbd2116a-8961-4954-87ae-e4575bd29ce0",
	request_id: "53bded77-7b9d-4e82-8771-991a34d759f9",
	time: "2022-05-19T16:45:57.122Z",
	organization_id: MockOrganization.id,
	organization: {
		id: MockOrganization.id,
		name: MockOrganization.name,
		display_name: MockOrganization.display_name,
		icon: MockOrganization.icon,
	},
	ip: "127.0.0.1",
	user_agent:
		'"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"',
	resource_type: "workspace",
	resource_id: "ef8d1cf4-82de-4fd9-8980-047dad6d06b5",
	resource_target: "bruno-dev",
	resource_icon: "",
	action: "create",
	diff: {
		ttl: {
			old: 0,
			new: 3600000000000,
			secret: false,
		},
	},
	status_code: 200,
	additional_fields: {},
	description: "{user} 创建工作区 {target}",
	user: MockUserOwner,
	resource_link: "/@admin/bruno-dev",
	is_deleted: false,
};

/**
 * MockOrganization2 的审计日志。
 */
export const MockAuditLog2: TypesGen.AuditLog = {
	...MockAuditLog,
	id: "53bded77-7b9d-4e82-8771-991a34d759f9",
	action: "write",
	time: "2022-05-20T16:45:57.122Z",
	description: "{user} 更新工作区 {target}",
	organization_id: MockOrganization2.id,
	organization: {
		id: MockOrganization2.id,
		name: MockOrganization2.name,
		display_name: MockOrganization2.display_name,
		icon: MockOrganization2.icon,
	},
	diff: {
		workspace_name: {
			old: "old-workspace-name",
			new: MockWorkspace.name,
			secret: false,
		},
		workspace_auto_off: {
			old: true,
			new: false,
			secret: false,
		},
		template_version_id: {
			old: "fbd2116a-8961-4954-87ae-e4575bd29ce0",
			new: "53bded77-7b9d-4e82-8771-991a34d759f9",
			secret: false,
		},
		roles: {
			old: null,
			new: ["admin", "auditor"],
			secret: false,
		},
	},
};

/**
 * 一条没有组织的审计日志。
 */
export const MockAuditLog3: TypesGen.AuditLog = {
	id: "8efa9208-656a-422d-842d-b9dec0cf1bf3",
	request_id: "57ee9510-8330-480d-9ffa-4024e5805465",
	time: "2024-06-11T01:32:11.123Z",
	organization_id: "00000000-0000-0000-000000000000",
	ip: "127.0.0.1",
	user_agent:
		'"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"',
	resource_type: "template",
	resource_id: "a624458c-1562-4689-a671-42c0b7d2d0c5",
	resource_target: "docker",
	resource_icon: "",
	action: "write",
	diff: {
		display_name: {
			old: "旧的显示名称",
			new: "新的显示名称",
			secret: false,
		},
	},
	status_code: 200,
	additional_fields: {},
	description: "{user} 更新模板 {target}",
	user: MockUserOwner,
	resource_link: "/templates/docker",
	is_deleted: false,
};

export const MockWorkspaceCreateAuditLogForDifferentOwner = {
	...MockAuditLog,
	additional_fields: {
		workspace_owner: "成员",
	},
};

export const MockAuditLogWithWorkspaceBuild: TypesGen.AuditLog = {
	...MockAuditLog,
	id: "f90995bf-4a2b-4089-b597-e66e025e523e",
	request_id: "61555889-2875-475c-8494-f7693dd5d75b",
	action: "stop",
	resource_type: "workspace_build",
	description: "{user} 停止了工作区 {target} 的构建",
	additional_fields: {
		workspace_name: "test2",
	},
};

export const MockAuditLogWithDeletedResource: TypesGen.AuditLog = {
	...MockAuditLog,
	is_deleted: true,
};

export const MockAuditLogGitSSH: TypesGen.AuditLog = {
	...MockAuditLog,
	diff: {
		private_key: {
			old: "",
			new: "",
			secret: true,
		},
		public_key: {
			old: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINRUPjBSNtOAnL22+r07OSu9t3Lnm8/5OX8bRHECKS9g\n",
			new: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEwoUPJPMekuSzMZyV0rA82TGGNzw/Uj/dhLbwiczTpV\n",
			secret: false,
		},
	},
};

const _MockAuditOauthConvert: TypesGen.AuditLog = {
	...MockAuditLog,
	resource_type: "convert_login",
	resource_target: "oidc",
	action: "create",
	status_code: 201,
	description: "{user} 创建了登录类型转换为 {target}",
	diff: {
		created_at: {
			old: "0001-01-01T00:00:00Z",
			new: "2023-06-20T20:44:54.243019Z",
			secret: false,
		},
		expires_at: {
			old: "0001-01-01T00:00:00Z",
			new: "2023-06-20T20:49:54.243019Z",
			secret: false,
		},
		state_string: {
			old: "",
			new: "",
			secret: true,
		},
		to_type: {
			old: "",
			new: "oidc",
			secret: false,
		},
		user_id: {
			old: "",
			new: "dc790496-eaec-4f88-a53f-8ce1f61a1fff",
			secret: false,
		},
	},
};

export const MockAuditLogSuccessfulLogin: TypesGen.AuditLog = {
	...MockAuditLog,
	resource_type: "api_key",
	resource_target: "",
	action: "login",
	status_code: 201,
	description: "{user} 登录",
};

export const MockAuditLogUnsuccessfulLoginKnownUser: TypesGen.AuditLog = {
	...MockAuditLogSuccessfulLogin,
	status_code: 401,
};

export const MockAuditLogRequestPasswordReset: TypesGen.AuditLog = {
	...MockAuditLog,
	resource_type: "user",
	resource_target: "member",
	action: "request_password_reset",
	description: "请求重置 {target} 的密码",
	diff: {
		hashed_password: {
			old: "",
			new: "",
			secret: true,
		},
		one_time_passcode_expires_at: {
			old: {
				Time: "0001-01-01T00:00:00Z",
				Valid: false,
			},
			new: {
				Time: "2024-10-22T09:03:23.961702Z",
				Valid: true,
			},
			secret: false,
		},
	},
};

export const MockWebConnectionLog: TypesGen.ConnectionLog = {
	id: "497dcba3-ecbf-4587-a2dd-5eb0665e6880",
	connect_time: "2022-05-19T16:45:57.122Z",
	organization: {
		id: MockOrganization.id,
		name: MockOrganization.name,
		display_name: MockOrganization.display_name,
		icon: MockOrganization.icon,
	},
	workspace_owner_id: MockUserMember.id,
	workspace_owner_username: MockUserMember.username,
	workspace_id: MockWorkspace.id,
	workspace_name: MockWorkspace.name,
	agent_name: "dev",
	ip: "127.0.0.1",
	type: "workspace_app",
	web_info: {
		user_agent:
			'"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"',
		user: MockUserMember,
		slug_or_port: "code-server",
		status_code: 200,
	},
};

export const MockConnectedSSHConnectionLog: TypesGen.ConnectionLog = {
	id: "7884a866-4ae1-4945-9fba-b2b8d2b7c5a9",
	connect_time: "2022-05-19T16:45:57.122Z",
	organization: {
		id: MockOrganization.id,
		name: MockOrganization.name,
		display_name: MockOrganization.display_name,
		icon: MockOrganization.icon,
	},
	workspace_owner_id: MockUserMember.id,
	workspace_owner_username: MockUserMember.username,
	workspace_id: MockWorkspace.id,
	workspace_name: MockWorkspace.name,
	agent_name: "dev",
	ip: "127.0.0.1",
	type: "ssh",
	ssh_info: {
		connection_id: "026c8c11-fc5c-4df8-a286-5fe6d7f54f98",
		disconnect_reason: undefined,
		disconnect_time: undefined,
		exit_code: undefined,
	},
};

export const MockDisconnectedSSHConnectionLog: TypesGen.ConnectionLog = {
	id: "893e75e0-1518-4ac8-9629-35923a39533a",
	connect_time: "2022-05-19T16:45:57.122Z",
	organization: {
		id: MockOrganization.id,
		name: MockOrganization.name,
		display_name: MockOrganization.display_name,
		icon: MockOrganization.icon,
	},
	workspace_owner_id: MockUserMember.id,
	workspace_owner_username: MockUserMember.username,
	workspace_id: MockWorkspace.id,
	workspace_name: MockWorkspace.name,
	agent_name: "dev",
	ip: "127.0.0.1",
	type: "ssh",
	ssh_info: {
		connection_id: "026c8c11-fc5c-4df8-a286-5fe6d7f54f98",
		disconnect_reason: "服务器关闭",
		disconnect_time: "2022-05-19T16:49:57.122Z",
		exit_code: 0,
	},
};

export const MockWorkspaceQuota: TypesGen.WorkspaceQuota = {
	credits_consumed: 0,
	budget: 100,
};

export const MockGroupSyncSettings: TypesGen.GroupSyncSettings = {
	field: "group-test",
	mapping: {
		"idp-group-1": [
			"fbd2116a-8961-4954-87ae-e4575bd29ce0",
			"13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e2",
		],
		"idp-group-2": ["fbd2116a-8961-4954-87ae-e4575bd29ce0"],
	},
	regex_filter: "@[a-zA-Z0-9_]+",
	auto_create_missing_groups: false,
};

export const MockLegacyMappingGroupSyncSettings = {
	...MockGroupSyncSettings,
	mapping: {},
	legacy_group_name_mapping: {
		"idp-group-1": "fbd2116a-8961-4954-87ae-e4575bd29ce0",
		"idp-group-2": "13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e2",
	},
} satisfies TypesGen.GroupSyncSettings;

export const MockGroupSyncSettings2: TypesGen.GroupSyncSettings = {
	field: "group-test",
	mapping: {
		"idp-group-1": [
			"fbd2116a-8961-4954-87ae-e4575bd29ce0",
			"13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e3",
		],
		"idp-group-2": ["fbd2116a-8961-4954-87ae-e4575bd29ce2"],
	},
	regex_filter: "@[a-zA-Z0-9_]+",
	auto_create_missing_groups: false,
};

export const MockMultipleOverflowGroupSyncSettings: TypesGen.GroupSyncSettings =
	{
		field: "group-multiple-overflow-test",
		mapping: {
			"idp-group-1": [
				"fbd2116a-8961-4954-87ae-e4575bd29ce0",
				"13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e2",
				"d3562dc1-c120-43a9-ba02-88e43bbca192",
			],
		},
		regex_filter: "@[a-zA-Z0-9_]+",
		auto_create_missing_groups: false,
	};

export const MockRoleSyncSettings: TypesGen.RoleSyncSettings = {
	field: "role-test",
	mapping: {
		"idp-role-1": ["admin", "developer"],
		"idp-role-2": ["auditor"],
	},
};

export const MockOrganizationSyncSettings: TypesGen.OrganizationSyncSettings = {
	field: "organization-test",
	mapping: {
		"idp-org-1": [
			"fbd2116a-8961-4954-87ae-e4575bd29ce0",
			"13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e2",
		],
		"idp-org-2": ["fbd2116a-8961-4954-87ae-e4575bd29ce0"],
	},
	organization_assign_default: true,
};

export const MockOrganizationSyncSettings2: TypesGen.OrganizationSyncSettings =
	{
		field: "organization-test",
		mapping: {
			"idp-org-1": [
				"my-organization-id",
				"my-organization-2-id",
				"my-organization-3-id",
			],
			"idp-org-2": ["my-organization-id"],
		},
		organization_assign_default: true,
	};

export const MockOrganizationSyncSettingsEmpty: TypesGen.OrganizationSyncSettings =
	{
		field: "",
		mapping: {},
		organization_assign_default: true,
	};

export const MockGroup: TypesGen.Group = {
	id: "fbd2116a-8961-4954-87ae-e4575bd29ce0",
	name: "前端",
	display_name: "前端",
	avatar_url: "https://example.com",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	members: [MockUserOwner, MockUserMember],
	quota_allowance: 5,
	source: "user",
	total_member_count: 2,
};

export const MockGroupWithoutMembers: TypesGen.Group = {
	id: "fbd2116a-8961-4954-87ae-e4575bd29ce0",
	name: "前端",
	display_name: "前端",
	avatar_url: "https://example.com",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	members: [],
	quota_allowance: 5,
	source: "user",
	total_member_count: 2,
};

export const MockGroup2: TypesGen.Group = {
	id: "13de3eb4-9b4f-49e7-b0f8-0c3728a0d2e2",
	name: "developer",
	display_name: "",
	avatar_url: "https://example.com",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	members: [MockUserOwner, MockUserMember],
	quota_allowance: 5,
	source: "user",
	total_member_count: 2,
};

export const MockGroup3: TypesGen.Group = {
	id: "d3562dc1-c120-43a9-ba02-88e43bbca192",
	name: "后端",
	display_name: "",
	avatar_url: "https://example.com",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	members: [MockUserOwner, MockUserMember],
	quota_allowance: 5,
	source: "user",
	total_member_count: 2,
};

const MockEveryoneGroup: TypesGen.Group = {
	// The "Everyone" group must have the same ID as a the organization it belongs
	// to.
	id: MockOrganization.id,
	name: "所有人",
	display_name: "",
	organization_id: MockOrganization.id,
	organization_name: MockOrganization.name,
	organization_display_name: MockOrganization.display_name,
	members: [],
	avatar_url: "",
	quota_allowance: 0,
	source: "user",
	total_member_count: 0,
};

export const MockTemplateACL: TypesGen.TemplateACL = {
	group: [
		{ ...MockEveryoneGroup, role: "use" },
		{ ...MockGroup, role: "admin" },
	],
	users: [{ ...MockUserOwner, role: "use" }],
};

export const MockTemplateACLEmpty: TypesGen.TemplateACL = {
	group: [],
	users: [],
};

export const MockTemplateExample: TypesGen.TemplateExample = {
	id: "aws-windows",
	url: "https://github.com/coder/coder/tree/main/examples/templates/aws-windows",
	name: "在 ECS 托管的容器中开发",
	description: "在 AWS ECS 上开始 Linux 开发。",
	markdown:
		"\n# aws-ecs\n\n这是一个用于在 ECS 上运行 Coder 工作区的示例模板。它假设已经存在一个基于 EC2 计算的 ECS 集群来托管工作区。\n\n## 架构\n\n此工作区使用以下 AWS 资源构建：\n\n- 任务定义 - 容器定义，包括镜像、命令、卷\n- ECS 服务 - 管理任务定义\n\n## code-server\n\n`code-server` 通过 `coder_agent` 资源块中的 `startup_script` 参数安装。`coder_app` 资源被定义用于通过控制面板 UI 在 `localhost:13337` 上访问 `code-server`。\n",
	icon: "/icon/aws.svg",
	tags: ["aws", "cloud"],
};

export const MockTemplateExample2: TypesGen.TemplateExample = {
	id: "aws-linux",
	url: "https://github.com/coder/coder/tree/main/examples/templates/aws-linux",
	name: "在 AWS EC2 上的 Linux 中开发",
	description: "在 AWS EC2 上开始 Linux 开发。",
	markdown:
		'\n# aws-linux\n\n开始使用，运行 `coder templates init`。出现提示时，选择此模板。按照屏幕上的说明继续。\n\n## 身份验证\n\n此模板假设 coderd 运行在一个已通过 AWS 身份验证的环境中。例如，运行 `aws configure import` 以在系统和运行 coderd 的用户上导入凭据。关于其他身份验证方式，请查阅 [Terraform 文档](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)。\n\n## 所需权限/策略\n\n以下示例策略允许 Coder 创建 EC2 实例并修改由 Coder 预置的实例：\n\n```json\n{\n    "Version": "2012-10-17",\n    "Statement": [\n        {\n            "Sid": "VisualEditor0",\n            "Effect": "Allow",\n            "Action": [\n                "ec2:GetDefaultCreditSpecification",\n                "ec2:DescribeIamInstanceProfileAssociations",\n                "ec2:DescribeTags",\n                "ec2:CreateTags",\n                "ec2:RunInstances",\n                "ec2:DescribeInstanceCreditSpecifications",\n                "ec2:DescribeImages",\n                "ec2:ModifyDefaultCreditSpecification",\n                "ec2:DescribeVolumes"\n            ],\n            "Resource": "*"\n        },\n        {\n            "Sid": "CoderResources",\n            "Effect": "Allow",\n            "Action": [\n                "ec2:DescribeInstances",\n                "ec2:DescribeInstanceAttribute",\n                "ec2:UnmonitorInstances",\n                "ec2:TerminateInstances",\n                "ec2:StartInstances",\n                "ec2:StopInstances",\n                "ec2:DeleteTags",\n                "ec2:MonitorInstances",\n                "ec2:CreateTags",\n                "ec2:RunInstances",\n                "ec2:ModifyInstanceAttribute",\n                "ec2:ModifyInstanceCreditSpecification"\n            ],\n            "Resource": "arn:aws:ec2:*:*:instance/*",\n            "Condition": {\n                "StringEquals": {\n                    "aws:ResourceTag/Coder_Provisioned": "true"\n                }\n            }\n        }\n    ]\n}\n```\n\n## code-server\n\n`code-server` 通过 `coder_agent` 资源块中的 `startup_script` 参数安装。`coder_app` 资源被定义用于通过控制面板 UI 在 `localhost:13337` 上访问 `code-server`。\n',
	icon: "/icon/aws.svg",
	tags: ["aws", "cloud"],
};

export const MockPermissions: Permissions = {
	createTemplates: true,
	createUser: true,
	deleteTemplates: true,
	updateTemplates: true,
	viewAllUsers: true,
	updateUsers: true,
	viewAnyAuditLog: true,
	viewAnyConnectionLog: true,
	viewDeploymentConfig: true,
	editDeploymentConfig: true,
	viewDeploymentStats: true,
	readWorkspaceProxies: true,
	editWorkspaceProxies: true,
	createOrganization: true,
	viewAnyGroup: true,
	createGroup: true,
	viewAllLicenses: true,
	viewNotificationTemplate: true,
	viewOrganizationIDPSyncSettings: true,
	viewDebugInfo: true,
	assignAnyRoles: true,
	editAnyGroups: true,
	editAnySettings: true,
	viewAnyIdpSyncSettings: true,
	viewAnyMembers: true,
	viewAnyAIBridgeInterception: true,
	viewAnyAIProvider: true,
	createOAuth2App: true,
	editOAuth2App: true,
	deleteOAuth2App: true,
	viewOAuth2AppSecrets: true,
	createChat: true,
};

export const MockNoPermissions: Permissions = {
	createTemplates: false,
	createUser: false,
	deleteTemplates: false,
	updateTemplates: false,
	viewAllUsers: false,
	updateUsers: false,
	viewAnyAuditLog: false,
	viewAnyConnectionLog: false,
	viewDeploymentConfig: false,
	editDeploymentConfig: false,
	viewDeploymentStats: false,
	readWorkspaceProxies: false,
	editWorkspaceProxies: false,
	createOrganization: false,
	viewAnyGroup: false,
	createGroup: false,
	viewAllLicenses: false,
	viewNotificationTemplate: false,
	viewOrganizationIDPSyncSettings: false,
	viewDebugInfo: false,
	assignAnyRoles: false,
	editAnyGroups: false,
	editAnySettings: false,
	viewAnyIdpSyncSettings: false,
	viewAnyMembers: false,
	viewAnyAIBridgeInterception: true,
	viewAnyAIProvider: false,
	createOAuth2App: false,
	editOAuth2App: false,
	deleteOAuth2App: false,
	viewOAuth2AppSecrets: false,
	createChat: false,
};

export const MockOrganizationPermissions: OrganizationPermissions = {
	viewMembers: true,
	editMembers: true,
	createGroup: true,
	viewGroups: true,
	editGroups: true,
	editSettings: true,
	viewOrgRoles: true,
	createOrgRoles: true,
	assignOrgRoles: true,
	updateOrgRoles: true,
	deleteOrgRoles: true,
	viewProvisioners: true,
	viewProvisionerJobs: true,
	viewIdpSyncSettings: true,
	editIdpSyncSettings: true,
};

export const MockNoOrganizationPermissions: OrganizationPermissions = {
	viewMembers: false,
	editMembers: false,
	createGroup: false,
	viewGroups: false,
	editGroups: false,
	editSettings: false,
	viewOrgRoles: false,
	createOrgRoles: false,
	assignOrgRoles: false,
	updateOrgRoles: false,
	deleteOrgRoles: false,
	viewProvisioners: false,
	viewProvisionerJobs: false,
	viewIdpSyncSettings: false,
	editIdpSyncSettings: false,
};

export const MockDeploymentConfig: DeploymentConfig = {
	config: {
		enable_terraform_debug_mode: true,
	},
	options: [],
};

export const MockAppearanceConfig: TypesGen.AppearanceConfig = {
	application_name: "",
	logo_url: "",
	service_banner: {
		enabled: false,
	},
	announcement_banners: [],
	docs_url: "https://coder.com/docs/@main/",
};

export const MockWorkspaceBuildParameter1: TypesGen.WorkspaceBuildParameter = {
	name: MockTemplateVersionParameter1.name,
	value: "mock-abc",
};

export const MockWorkspaceBuildParameter2: TypesGen.WorkspaceBuildParameter = {
	name: MockTemplateVersionParameter2.name,
	value: "3",
};

export const MockWorkspaceBuildParameter3: TypesGen.WorkspaceBuildParameter = {
	name: MockTemplateVersionParameter3.name,
	value: "my-database",
};

export const MockWorkspaceBuildParameter4: TypesGen.WorkspaceBuildParameter = {
	name: MockTemplateVersionParameter4.name,
	value: "immutable-value",
};

export const MockWorkspaceBuildParameter5: TypesGen.WorkspaceBuildParameter = {
	name: MockTemplateVersionParameter5.name,
	value: "5",
};

export const MockPreviewParameter: TypesGen.PreviewParameter = {
	name: "parameter1",
	display_name: "参数 1",
	description: "这是一个参数",
	type: "string",
	form_type: "input",
	mutable: true,
	ephemeral: false,
	required: true,
	value: { valid: true, value: "" },
	default_value: { valid: true, value: "" },
	options: [],
	validations: [],
	diagnostics: [],
	icon: "",
	styling: {},
	order: 0,
};

export const MockDropdownParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "instance_type",
	display_name: "实例类型",
	description: "要创建的实例类型",
	form_type: "dropdown",
	default_value: { value: "t3.micro", valid: true },
	options: [
		{
			name: "t3.micro",
			description: "微型实例",
			value: { value: "t3.micro", valid: true },
			icon: "",
		},
		{
			name: "t3.small",
			description: "小型实例",
			value: { value: "t3.small", valid: true },
			icon: "",
		},
		{
			name: "t3.medium",
			description: "中型实例",
			value: { value: "t3.medium", valid: true },
			icon: "",
		},
	],
	styling: {
		placeholder: "",
		disabled: false,
		label: "",
	},
	order: 1,
};

const MockTagSelectParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "tags",
	display_name: "标签",
	description: "资源标签",
	type: "list(string)",
	form_type: "tag-select",
	required: false,
	value: { value: "[]", valid: true },
	default_value: { value: "[]", valid: true },
	styling: {
		placeholder: "",
		disabled: false,
		label: "",
	},
	order: 4,
};

const MockSwitchParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "enable_monitoring",
	display_name: "启用监控",
	description: "启用系统监控",
	type: "bool",
	form_type: "switch",
	required: false,
	value: { value: "true", valid: true },
	default_value: { value: "true", valid: true },
	styling: {
		placeholder: "",
		disabled: false,
		label: "",
	},
	order: 3,
};

export const MockSliderParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "cpu_count",
	display_name: "CPU 数量",
	description: "CPU 核心数",
	type: "number",
	form_type: "slider",
	value: { value: "2", valid: true },
	default_value: { value: "2", valid: true },
	styling: {
		placeholder: "",
		disabled: false,
		label: "",
	},
	order: 2,
};

const MockMultiSelectParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "ides",
	display_name: "IDE",
	description: "已启用的 IDE",
	type: "list(string)",
	form_type: "multi-select",
	required: false,
	value: { value: "[]", valid: true },
	default_value: { value: "[]", valid: true },
	options: [
		{
			name: "vscode",
			description: "Visual Studio Code",
			value: { value: "vscode", valid: true },
			icon: "",
		},
		{
			name: "cursor",
			description: "Cursor",
			value: { value: "cursor", valid: true },
			icon: "",
		},
		{
			name: "goland",
			description: "Goland",
			value: { value: "goland", valid: true },
			icon: "",
		},
		{
			name: "windsurf",
			description: "Windsurf",
			value: { value: "windsurf", valid: true },
			icon: "",
		},
	],
	order: 5,
};

export const MockValidationParameter: TypesGen.PreviewParameter = {
	...MockPreviewParameter,
	name: "invalid_number",
	display_name: "无效参数",
	description: "带有验证错误的数字参数",
	type: "number",
	form_type: "input",
	value: { value: "50", valid: true },
	default_value: { value: "50", valid: true },
	validations: [
		{
			validation_error: "数字必须在 0 到 100 之间",
			validation_regex: null,
			validation_min: 0,
			validation_max: 100,
			validation_monotonic: null,
		},
	],
	order: 1,
};

export const MockDynamicParametersResponse: TypesGen.DynamicParametersResponse =
	{
		id: 1,
		parameters: [
			MockDropdownParameter,
			MockSliderParameter,
			MockSwitchParameter,
			MockTagSelectParameter,
			MockMultiSelectParameter,
		],
		diagnostics: [],
	};

export const MockDynamicParametersResponseWithError: TypesGen.DynamicParametersResponse =
	{
		id: 2,
		parameters: [MockDropdownParameter],
		diagnostics: [
			{
				severity: "error",
				summary: "验证失败",
				detail: "所选的实例类型在此区域中不可用",
				extra: {
					code: "",
				},
			},
		],
	};

export const MockTemplateVersionExternalAuthGithub: TypesGen.TemplateVersionExternalAuth =
	{
		id: "github",
		type: "github",
		authenticate_url: "https://example.com/external-auth/github",
		authenticated: false,
		display_icon: "/icon/github.svg",
		display_name: "GitHub",
	};

export const MockTemplateVersionExternalAuthGithubAuthenticated: TypesGen.TemplateVersionExternalAuth =
	{
		id: "github",
		type: "github",
		authenticate_url: "https://example.com/external-auth/github",
		authenticated: true,
		display_icon: "/icon/github.svg",
		display_name: "GitHub",
	};

export const MockDeploymentStats: TypesGen.DeploymentStats = {
	aggregated_from: "2023-03-06T19:08:55.211625Z",
	collected_at: "2023-03-06T19:12:55.211625Z",
	next_update_at: "2023-03-06T19:20:55.211625Z",
	session_count: {
		vscode: 128,
		jetbrains: 5,
		ssh: 32,
		reconnecting_pty: 15,
	},
	workspaces: {
		building: 15,
		failed: 12,
		pending: 5,
		running: 32,
		stopped: 16,
		connection_latency_ms: {
			P50: 32.56,
			P95: 15.23,
		},
		rx_bytes: 15613513253,
		tx_bytes: 36113513253,
	},
};

export const MockDeploymentSSH: TypesGen.SSHConfigResponse = {
	hostname_prefix: " coder.",
	ssh_config_options: {},
	hostname_suffix: "coder",
};

export const MockWorkspaceAgentLogs: TypesGen.WorkspaceAgentLog[] = [
	{
		id: 166663,
		created_at: "2023-05-04T11:30:41.402072Z",
		output: "+ curl -fsSL https://code-server.dev/install.sh",
		level: "info",
		source_id: MockWorkspaceAgentLogSource.id,
	},
	{
		id: 166664,
		created_at: "2023-05-04T11:30:41.40228Z",
		output:
			"+ sh -s -- --method=standalone --prefix=/tmp/code-server --version 4.8.3",
		level: "info",
		source_id: MockWorkspaceAgentLogSource.id,
	},
	{
		id: 166665,
		created_at: "2023-05-04T11:30:42.590731Z",
		output: "Ubuntu 22.04.2 LTS",
		level: "info",
		source_id: MockWorkspaceAgentLogSource.id,
	},
	{
		id: 166666,
		created_at: "2023-05-04T11:30:42.593686Z",
		output: "正在从 GitHub 安装 amd64 版本的 v4.8.3。",
		level: "info",
		source_id: MockWorkspaceAgentLogSource.id,
	},
];

export const MockLicenseResponse: GetLicensesResponse[] = [
	{
		id: 1,
		uploaded_at: "1660104000",
		expires_at: "3420244800", // 到期于 2078年5月20日
		uuid: "1",
		claims: {
			trial: false,
			all_features: true,
			feature_set: "enterprise",
			version: 1,
			features: {},
			license_expires: 3420244800,
			nbf: 1660104000, // 自 2022年8月10日 起有效
		},
	},
	{
		id: 1,
		uploaded_at: "1660104000",
		expires_at: "3420244800", // 到期于 2078年5月20日
		uuid: "1",
		claims: {
			trial: false,
			all_features: true,
			feature_set: "PREMIUM",
			version: 1,
			features: {},
			license_expires: 3420244800,
			nbf: 1660104000, // 自 2022年8月10日 起有效
		},
	},
	{
		id: 1,
		uploaded_at: "1660104000",
		expires_at: "3420244800", // 到期于 2078年5月20日
		uuid: "1",
		claims: {
			trial: false,
			all_features: true,
			version: 1,
			features: {},
			license_expires: 3420244800,
			nbf: 1660104000, // 自 2022年8月10日 起有效
		},
	},
	{
		id: 1,
		uploaded_at: "1660104000",
		expires_at: "1660104000", // 于 2022年8月10日 过期
		uuid: "1",
		claims: {
			trial: false,
			all_features: true,
			version: 1,
			features: {},
			license_expires: 1660104000,
			nbf: 1628568000, // 自 2021年8月10日 起有效
		},
	},
	{
		id: 1,
		uploaded_at: "1682346425",
		expires_at: "1682346425", // 于 2023年4月24日 过期
		uuid: "1",
		claims: {
			trial: false,
			all_features: true,
			version: 1,
			features: {},
			license_expires: 1682346425,
			nbf: 1650810425, // 自 2022年4月24日 起有效
		},
	},
];

export const MockHealth: TypesGen.HealthcheckReport = {
	time: "2023-08-01T16:51:03.29792825Z",
	healthy: true,
	severity: "ok",
	derp: {
		healthy: true,
		severity: "ok",
		warnings: [],
		dismissed: false,
		regions: {
			"999": {
				healthy: true,
				severity: "ok",
				warnings: [],
				region: {
					EmbeddedRelay: true,
					RegionID: 999,
					RegionCode: "coder",
					RegionName: "Council Bluffs, Iowa",
					Nodes: [
						{
							Name: "999stun0",
							RegionID: 999,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						{
							Name: "999b",
							RegionID: 999,
							HostName: "dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
					],
				},
				node_reports: [
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "999stun0",
							RegionID: 999,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: false,
						round_trip_ping: "0",
						round_trip_ping_ms: 0,
						uses_websocket: false,
						client_logs: [],
						client_errs: [],
						stun: {
							Enabled: true,
							CanSTUN: true,
							Error: null,
						},
					},
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "999b",
							RegionID: 999,
							HostName: "dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: true,
						round_trip_ping: "7674330",
						round_trip_ping_ms: 7674330,
						uses_websocket: false,
						client_logs: [
							[
								"derphttp.Client.Connect: 正在连接到 https://dev.coder.com/derp",
							],
							[
								"derphttp.Client.Connect: 正在连接到 https://dev.coder.com/derp",
							],
						],
						client_errs: [
							["收到 derp 消息: derphttp.Client 关闭"],
							[
								"连接至 derp: derphttp.Client.Connect 连接至 <https://sao-paulo.fly.dev.coder.com/derp> 超时: context deadline exceeded: read tcp 10.44.1.150:59546-&gt;149.248.214.149:443: use of closed network connection",
								"连接至 derp: derphttp.Client 关闭",
								"连接至 derp: derphttp.Client 关闭",
								"连接至 derp: derphttp.Client 关闭",
								"连接至 derp: derphttp.Client 关闭",
								"连接 5 次后均失败，最后一次错误: 连接 5 次后均失败，最后一次错误: derphttp.Client 关闭",
							],
						],
						stun: {
							Enabled: false,
							CanSTUN: false,
							Error: null,
						},
					},
				],
			},
			"10007": {
				healthy: true,
				severity: "ok",
				warnings: [],
				region: {
					EmbeddedRelay: false,
					RegionID: 10007,
					RegionCode: "coder_sydney",
					RegionName: "sydney",
					Nodes: [
						{
							Name: "10007stun0",
							RegionID: 10007,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						{
							Name: "10007a",
							RegionID: 10007,
							HostName: "sydney.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
					],
				},
				node_reports: [
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10007stun0",
							RegionID: 10007,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: false,
						round_trip_ping: "0",
						round_trip_ping_ms: 0,
						uses_websocket: false,
						client_logs: [],
						client_errs: [],
						stun: {
							Enabled: true,
							CanSTUN: true,
							Error: null,
						},
					},
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10007a",
							RegionID: 10007,
							HostName: "sydney.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: true,
						round_trip_ping: "170527034",
						round_trip_ping_ms: 170527034,
						uses_websocket: false,
						client_logs: [
							[
								"derphttp.Client.Connect: 正在连接到 https://sydney.dev.coder.com/derp",
							],
							[
								"derphttp.Client.Connect: 正在连接到 https://sydney.dev.coder.com/derp",
							],
						],
						client_errs: [[], []],
						stun: {
							Enabled: false,
							CanSTUN: false,
							Error: null,
						},
					},
				],
			},
			"10008": {
				healthy: true,
				severity: "ok",
				warnings: [],
				region: {
					EmbeddedRelay: false,
					RegionID: 10008,
					RegionCode: "coder_europe-frankfurt",
					RegionName: "europe-frankfurt",
					Nodes: [
						{
							Name: "10008stun0",
							RegionID: 10008,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						{
							Name: "10008a",
							RegionID: 10008,
							HostName: "europe.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
					],
				},
				node_reports: [
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10008stun0",
							RegionID: 10008,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: false,
						round_trip_ping: "0",
						round_trip_ping_ms: 0,
						uses_websocket: false,
						client_logs: [],
						client_errs: [],
						stun: {
							Enabled: true,
							CanSTUN: true,
							Error: null,
						},
					},
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10008a",
							RegionID: 10008,
							HostName: "europe.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: true,
						round_trip_ping: "111329690",
						round_trip_ping_ms: 111329690,
						uses_websocket: false,
						client_logs: [
							[
								"derphttp.Client.Connect: 正在连接到 https://europe.dev.coder.com/derp",
							],
							[
								"derphttp.Client.Connect: 正在连接到 https://europe.dev.coder.com/derp",
							],
						],
						client_errs: [[], []],
						stun: {
							Enabled: false,
							CanSTUN: false,
							Error: null,
						},
					},
				],
			},
			"10009": {
				healthy: true,
				severity: "ok",
				warnings: [],
				region: {
					EmbeddedRelay: false,
					RegionID: 10009,
					RegionCode: "coder_brazil-saopaulo",
					RegionName: "brazil-saopaulo",
					Nodes: [
						{
							Name: "10009stun0",
							RegionID: 10009,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						{
							Name: "10009a",
							RegionID: 10009,
							HostName: "brazil.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
					],
				},
				node_reports: [
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10009stun0",
							RegionID: 10009,
							HostName: "stun.l.google.com",
							STUNPort: 19302,
							STUNOnly: true,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: false,
						round_trip_ping: "0",
						round_trip_ping_ms: 0,
						uses_websocket: false,
						client_logs: [],
						client_errs: [],
						stun: {
							Enabled: true,
							CanSTUN: true,
							Error: null,
						},
					},
					{
						healthy: true,
						severity: "ok",
						warnings: [],
						node: {
							Name: "10009a",
							RegionID: 10009,
							HostName: "brazil.dev.coder.com",
							STUNPort: -1,
							DERPPort: 443,
						},
						node_info: {
							TokenBucketBytesPerSecond: 0,
							TokenBucketBytesBurst: 0,
						},
						can_exchange_messages: true,
						round_trip_ping: "138185506",
						round_trip_ping_ms: 138185506,
						uses_websocket: false,
						client_logs: [
							[
								"derphttp.Client.Connect: 正在连接到 https://brazil.dev.coder.com/derp",
							],
							[
								"derphttp.Client.Connect: 正在连接到 https://brazil.dev.coder.com/derp",
							],
						],
						client_errs: [[], []],
						stun: {
							Enabled: false,
							CanSTUN: false,
							Error: null,
						},
					},
				],
			},
		},
		netcheck: {
			UDP: true,
			IPv6: false,
			IPv4: true,
			IPv6CanSend: false,
			IPv4CanSend: true,
			OSHasIPv6: true,
			ICMPv4: false,
			MappingVariesByDestIP: false,
			HairPinning: null,
			UPnP: false,
			PMP: false,
			PCP: false,
			PreferredDERP: 999,
			RegionLatency: {
				"999": 1638180,
				"10007": 174853022,
				"10008": 112142029,
				"10009": 138855606,
			},
			RegionV4Latency: {
				"999": 1638180,
				"10007": 174853022,
				"10008": 112142029,
				"10009": 138855606,
			},
			RegionV6Latency: {},
			GlobalV4: "34.71.26.24:55368",
			GlobalV6: "",
			CaptivePortal: null,
		},
		netcheck_logs: [
			"netcheck: netcheck.runProbe: got STUN response for 10007stun0 from 34.71.26.24:55368 (9b07930007da49dd7df79bc7) in 1.791799ms",
			"netcheck: netcheck.runProbe: got STUN response for 999stun0 from 34.71.26.24:55368 (7397fec097f1d5b01364566b) in 1.791529ms",
			"netcheck: netcheck.runProbe: got STUN response for 10008stun0 from 34.71.26.24:55368 (1fdaaa016ca386485f097f68) in 2.192899ms",
			"netcheck: netcheck.runProbe: got STUN response for 10009stun0 from 34.71.26.24:55368 (2596fe60895fbd9542823a76) in 2.146459ms",
			"netcheck: netcheck.runProbe: got STUN response for 10007stun0 from 34.71.26.24:55368 (19ec320f3b76e8b027b06d3e) in 2.139619ms",
			"netcheck: netcheck.runProbe: got STUN response for 999stun0 from 34.71.26.24:55368 (a17973bc57c35e606c0f46f5) in 2.131089ms",
			"netcheck: netcheck.runProbe: got STUN response for 10008stun0 from 34.71.26.24:55368 (c958e15209d139a6e410f13a) in 2.127549ms",
			"netcheck: netcheck.runProbe: got STUN response for 10009stun0 from 34.71.26.24:55368 (284a1b64dff22f40a3514524) in 2.107549ms",
			"netcheck: [v1] measureAllICMPLatency: listen ip4:icmp 0.0.0.0: socket: operation not permitted",
			"netcheck: [v1] report: udp=true v6=false v6os=true mapvarydest=false hair= portmap= v4a=34.71.26.24:55368 derp=999 derpdist=999v4:2ms,10007v4:175ms,10008v4:112ms,10009v4:139ms",
		],
	},
	access_url: {
		healthy: true,
		severity: "ok",
		warnings: [],
		dismissed: false,
		access_url: "https://dev.coder.com",
		reachable: true,
		status_code: 200,
		healthz_response: "OK",
	},
	websocket: {
		healthy: true,
		severity: "ok",
		warnings: [],
		dismissed: false,
		body: "",
		code: 101,
	},
	database: {
		healthy: true,
		severity: "ok",
		warnings: [],
		dismissed: false,
		reachable: true,
		latency: "92570",
		latency_ms: 92570,
		threshold_ms: 92570,
	},
	workspace_proxy: {
		healthy: true,
		severity: "warning",
		warnings: [
			{
				code: "EWP04",
				message:
					'不健康: 代理请求失败: Get "http://127.0.0.1:3001/healthz-report": dial tcp 127.0.0.1:3001: connect: connection refused',
			},
		],
		dismissed: false,
		error: undefined,
		workspace_proxies: {
			regions: [
				{
					id: "1a3e5eb8-d785-4f7d-9188-2eeab140cd06",
					name: "primary",
					display_name: "Council Bluffs, Iowa",
					icon_url: "/emojis/1f3e1.png",
					healthy: true,
					path_app_url: "https://dev.coder.com",
					wildcard_hostname: "*--apps.dev.coder.com",
					derp_enabled: false,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.829032482Z",
					},
					created_at: "0001-01-01T00:00:00Z",
					updated_at: "0001-01-01T00:00:00Z",
					deleted: false,
					version: "",
				},
				{
					id: "2876ab4d-bcee-4643-944f-d86323642840",
					name: "sydney",
					display_name: "Sydney GCP",
					icon_url: "/emojis/1f1e6-1f1fa.png",
					healthy: true,
					path_app_url: "https://sydney.dev.coder.com",
					wildcard_hostname: "*--apps.sydney.dev.coder.com",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-05-01T19:15:56.606593Z",
					updated_at: "2023-12-05T14:13:36.647535Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
				{
					id: "9d786ce0-55b1-4ace-8acc-a4672ff8d41f",
					name: "europe-frankfurt",
					display_name: "Europe GCP (Frankfurt)",
					icon_url: "/emojis/1f1e9-1f1ea.png",
					healthy: true,
					path_app_url: "https://europe.dev.coder.com",
					wildcard_hostname: "*--apps.europe.dev.coder.com",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-05-01T20:34:11.114005Z",
					updated_at: "2023-12-05T14:13:45.941716Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
				{
					id: "2e209786-73b1-4838-ba78-e01c9334450a",
					name: "brazil-saopaulo",
					display_name: "Brazil GCP (Sao Paulo)",
					icon_url: "/emojis/1f1e7-1f1f7.png",
					healthy: true,
					path_app_url: "https://brazil.dev.coder.com",
					wildcard_hostname: "*--apps.brazil.dev.coder.com",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-05-01T20:41:02.76448Z",
					updated_at: "2023-12-05T14:13:41.968568Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
				{
					id: "c272e80c-0cce-49d6-9782-1b5cf90398e8",
					name: "unregistered",
					display_name: "未注册代理",
					icon_url: "/emojis/274c.png",
					healthy: false,
					path_app_url: "",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "unregistered",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-07-10T14:51:11.539222Z",
					updated_at: "2023-07-10T14:51:11.539223Z",
					deleted: false,
					version: "",
				},
				{
					id: "a3efbff1-587b-4677-80a4-dc4f892fed3e",
					name: "unhealthy",
					display_name: "不健康",
					icon_url: "/emojis/1f92e.png",
					healthy: false,
					path_app_url: "http://127.0.0.1:3001",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "unreachable",
						report: {
							errors: [
								'代理请求失败: Get "http://127.0.0.1:3001/healthz-report": dial tcp 127.0.0.1:3001: connect: connection refused',
							],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-07-10T14:51:48.407017Z",
					updated_at: "2023-07-10T14:51:57.993682Z",
					deleted: false,
					version: "",
				},
				{
					id: "b6cefb69-cb6f-46e2-9c9c-39c089fb7e42",
					name: "paris-coder",
					display_name: "欧洲 (巴黎)",
					icon_url: "/emojis/1f1eb-1f1f7.png",
					healthy: true,
					path_app_url: "https://paris-coder.fly.dev",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-12-01T09:21:15.996267Z",
					updated_at: "2023-12-05T14:13:59.663174Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
				{
					id: "72649dc9-03c7-46a8-bc95-96775e93ddc1",
					name: "sydney-coder",
					display_name: "澳大利亚 (悉尼)",
					icon_url: "/emojis/1f1e6-1f1fa.png",
					healthy: true,
					path_app_url: "https://sydney-coder.fly.dev",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-12-01T09:23:44.505529Z",
					updated_at: "2023-12-05T14:13:55.769058Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
				{
					id: "1f78398f-e5ae-4c38-aa89-30222181d443",
					name: "sao-paulo-coder",
					display_name: "巴西 (圣保罗)",
					icon_url: "/emojis/1f1e7-1f1f7.png",
					healthy: true,
					path_app_url: "https://sao-paulo-coder.fly.dev",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "ok",
						report: {
							errors: [],
							warnings: [],
						},
						checked_at: "2023-12-05T14:14:05.250322277Z",
					},
					created_at: "2023-12-01T09:36:00.231252Z",
					updated_at: "2023-12-05T14:13:47.015031Z",
					deleted: false,
					version: MockBuildInfo.version,
				},
			],
		},
	},
	provisioner_daemons: {
		severity: "ok",
		warnings: [
			{
				message: "出错了！",
				code: "EUNKNOWN",
			},
			{
				message: "这也挺糟糕的。",
				code: "EPD01",
			},
		],
		dismissed: false,
		items: [
			{
				provisioner_daemon: {
					id: "e455b582-ac04-4323-9ad6-ab71301fa006",
					organization_id: MockOrganization.id,
					key_id: MockProvisionerKey.id,
					created_at: "2024-01-04T15:53:03.21563Z",
					last_seen_at: "2024-01-04T16:05:03.967551Z",
					name: "ok",
					version: MockBuildInfo.version,
					api_version: MockBuildInfo.provisioner_api_version,
					provisioners: ["echo", "terraform"],
					tags: {
						owner: "",
						scope: "organization",
						tag_value: "value",
						tag_true: "true",
						tag_1: "1",
						tag_yes: "yes",
					},
					key_name: MockProvisionerKey.name,
					current_job: null,
					previous_job: null,
					status: "idle",
				},
				warnings: [],
			},
			{
				provisioner_daemon: {
					id: "00000000-0000-0000-000000000000",
					organization_id: MockOrganization.id,
					key_id: MockProvisionerKey.id,
					created_at: "2024-01-04T15:53:03.21563Z",
					last_seen_at: "2024-01-04T16:05:03.967551Z",
					name: "user-scoped",
					version: MockBuildInfo.version,
					api_version: MockBuildInfo.provisioner_api_version,
					provisioners: ["echo", "terraform"],
					tags: {
						owner: "12345678-1234-1234-1234-12345678abcd",
						scope: "user",
						tag_VALUE: "VALUE",
						tag_TRUE: "TRUE",
						tag_1: "1",
						tag_YES: "YES",
					},
					key_name: MockProvisionerKey.name,
					current_job: null,
					previous_job: null,
					status: "idle",
				},
				warnings: [],
			},
			{
				provisioner_daemon: {
					id: "e455b582-ac04-4323-9ad6-ab71301fa006",
					organization_id: MockOrganization.id,
					key_id: MockProvisionerKey.id,
					created_at: "2024-01-04T15:53:03.21563Z",
					last_seen_at: "2024-01-04T16:05:03.967551Z",
					name: "unhappy",
					version: "v0.0.1",
					api_version: "0.1",
					provisioners: ["echo", "terraform"],
					tags: {
						owner: "",
						scope: "organization",
						tag_string: "value",
						tag_false: "false",
						tag_0: "0",
						tag_no: "no",
					},
					key_name: MockProvisionerKey.name,
					current_job: null,
					previous_job: null,
					status: "idle",
				},
				warnings: [
					{
						message: "这个守护进程出了一些特定的问题。",
						code: "EUNKNOWN",
					},
					{
						message: "接下来是完全不同的事情。",
						code: "EUNKNOWN",
					},
				],
			},
		],
	},
	coder_version: MockBuildInfo.version,
};

export const MockListeningPortsResponse: TypesGen.WorkspaceAgentListeningPortsResponse =
	{
		ports: [
			{ process_name: "webb", network: "", port: 30000 },
			{ process_name: "gogo", network: "", port: 8080 },
			{ process_name: "", network: "", port: 8081 },
		],
	};

export const MockSharedPortsResponse: TypesGen.WorkspaceAgentPortShares = {
	shares: [
		{
			workspace_id: MockWorkspace.id,
			agent_name: "a-workspace-agent",
			port: 4000,
			share_level: "authenticated",
			protocol: "http",
		},
		{
			workspace_id: MockWorkspace.id,
			agent_name: "a-workspace-agent",
			port: 4443,
			share_level: "organization",
			protocol: "http",
		},
		{
			workspace_id: MockWorkspace.id,
			agent_name: "a-workspace-agent",
			port: 65535,
			share_level: "authenticated",
			protocol: "https",
		},
		{
			workspace_id: MockWorkspace.id,
			agent_name: "a-workspace-agent",
			port: 8081,
			share_level: "public",
			protocol: "http",
		},
	],
};

export const DeploymentHealthUnhealthy: TypesGen.HealthcheckReport = {
	healthy: false,
	severity: "ok",
	time: "2023-10-12T23:15:00.000000000Z",
	coder_version: "v2.3.0-devel+8cca4915a",
	access_url: {
		healthy: true,
		severity: "ok",
		warnings: [],
		dismissed: false,
		access_url: "",
		healthz_response: "",
		reachable: true,
		status_code: 0,
	},
	database: {
		healthy: false,
		severity: "ok",
		warnings: [],
		dismissed: false,
		latency: "",
		latency_ms: 0,
		reachable: true,
		threshold_ms: 92570,
	},
	derp: {
		healthy: false,
		severity: "ok",
		warnings: [],
		dismissed: false,
		regions: [],
		netcheck_logs: [],
	},
	websocket: {
		healthy: false,
		severity: "ok",
		warnings: [],
		dismissed: false,
		body: "",
		code: 0,
	},
	workspace_proxy: {
		healthy: false,
		error: "出了一些错误",
		severity: "error",
		warnings: [],
		dismissed: false,
		workspace_proxies: {
			regions: [
				{
					id: "df7e4b2b-2d40-47e5-a021-e5d08b219c77",
					name: "unhealthy",
					display_name: "不健康",
					icon_url: "/emojis/1f5fa.png",
					healthy: false,
					path_app_url: "http://127.0.0.1:3001",
					wildcard_hostname: "",
					derp_enabled: true,
					derp_only: false,
					status: {
						status: "unreachable",
						report: {
							errors: ["出了一些错误"],
							warnings: [],
						},
						checked_at: "2023-11-24T12:14:05.743303497Z",
					},
					created_at: "2023-11-23T15:37:25.513213Z",
					updated_at: "2023-11-23T18:09:19.734747Z",
					deleted: false,
					version: "v2.5.0-devel+89bae7eff",
				},
			],
		},
	},
	provisioner_daemons: {
		severity: "error",
		error: "出了点问题",
		warnings: [
			{
				message: "这是一条消息",
				code: "EUNKNOWN",
			},
		],
		dismissed: false,
		items: [
			{
				provisioner_daemon: {
					id: "e455b582-ac04-4323-9ad6-ab71301fa006",
					organization_id: MockOrganization.id,
					key_id: MockProvisionerKey.id,
					created_at: "2024-01-04T15:53:03.21563Z",
					last_seen_at: "2024-01-04T16:05:03.967551Z",
					name: "vvuurrkk-2",
					version: "v2.6.0-devel+965ad5e96",
					api_version: "1.0",
					provisioners: ["echo", "terraform"],
					tags: {
						owner: "",
						scope: "organization",
					},
					key_name: MockProvisionerKey.name,
					current_job: null,
					previous_job: null,
					status: "idle",
				},
				warnings: [
					{
						message: "这是针对这个东西的具体消息",
						code: "EUNKNOWN",
					},
				],
			},
		],
	},
};

export const MockHealthSettings: TypesGen.HealthSettings = {
	dismissed_healthchecks: [],
};

export const MockGithubExternalProvider: TypesGen.ExternalAuthLinkProvider = {
	id: "github",
	type: "github",
	device: false,
	display_icon: "/icon/github.svg",
	display_name: "GitHub",
	allow_refresh: true,
	allow_validate: true,
	supports_revocation: false,
	code_challenge_methods_supported: ["S256"],
};

export const MockGithubAuthLink: TypesGen.ExternalAuthLink = {
	provider_id: "github",
	created_at: "",
	updated_at: "",
	has_refresh_token: true,
	expires: "",
	authenticated: true,
	validate_error: "",
};

export const MockOAuth2ProviderApps: TypesGen.OAuth2ProviderApp[] = [
	{
		id: "1",
		name: "foo",
		callback_url: "http://localhost:3001",
		icon: "/icon/github.svg",
		endpoints: {
			authorization: "http://localhost:3001/oauth2/authorize",
			token: "http://localhost:3001/oauth2/token",
			device_authorization: "",
			token_revoke: "http://localhost:3001/oauth2/revoke",
		},
	},
];

export const MockOAuth2ProviderAppSecrets: TypesGen.OAuth2ProviderAppSecret[] =
	[
		{
			id: "1",
			client_secret_truncated: "foo",
			last_used_at: null,
		},
		{
			id: "1",
			last_used_at: "2022-12-16T20:10:45.637452Z",
			client_secret_truncated: "foo",
		},
	];

export const MockNotificationPreferences: TypesGen.NotificationPreference[] = [
	{
		id: "f44d9314-ad03-4bc8-95d0-5cad491da6b6",
		disabled: false,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "381df2a9-c0c0-4749-420f-80a9280c66f9",
		disabled: true,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "f517da0b-cdc9-410f-ab89-a86107c420ed",
		disabled: false,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "c34a0c09-0704-4cac-bd1c-0c0146811c2b",
		disabled: false,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "0ea69165-ec14-4314-91f1-69566ac3c5a0",
		disabled: false,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "51ce2fdf-c9ca-4be1-8d70-628674f9bc42",
		disabled: false,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
	{
		id: "4e19c0ac-94e1-4532-9515-d1801aa283b2",
		disabled: true,
		updated_at: "2024-08-06T11:58:37.755053Z",
	},
];

export const MockSystemNotificationTemplates: TypesGen.NotificationTemplate[] =
	[
		{
			id: "381df2a9-c0c0-4749-420f-80a9280c66f9",
			name: "工作区自动构建失败",
			title_template: '工作区 "{{.Labels.name}}" 自动构建失败',
			body_template:
				'你好 {{.UserName}}\n你的工作区 **{{.Labels.name}}** 的自动构建失败。\n指定的原因是 "**{{.Labels.reason}}**"。',
			actions:
				'[{"url": "{{ base_url }}/@{{.UserUsername}}/{{.Labels.name}}", "label": "查看工作区"}]',
			group: "工作区事件",
			method: "webhook",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "f517da0b-cdc9-410f-ab89-a86107c420ed",
			name: "工作区已删除",
			title_template: '工作区 "{{.Labels.name}}" 已删除',
			body_template:
				'你好 {{.UserName}}\n\n你的工作区 **{{.Labels.name}}** 已被删除。\n指定的原因是 "**{{.Labels.reason}}{{ if .Labels.initiator }} ({{ .Labels.initiator }}){{end}}**"。',
			actions:
				'[{"url": "{{ base_url }}/workspaces", "label": "查看工作区"}, {"url": "{{ base_url }}/templates", "label": "查看模板"}]',
			group: "工作区事件",
			method: "smtp",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "f44d9314-ad03-4bc8-95d0-5cad491da6b6",
			name: "用户账户已删除",
			title_template: '用户账户 "{{.Labels.deleted_account_name}}" 已删除',
			body_template:
				"你好 {{.UserName}},\n\n用户账户 **{{.Labels.deleted_account_name}}** 已被删除。",
			actions:
				'[{"url": "{{ base_url }}/deployment/users?filter=status%3Aactive", "label": "查看账户"}]',
			group: "用户事件",
			method: "",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "4e19c0ac-94e1-4532-9515-d1801aa283b2",
			name: "用户账户已创建",
			title_template: '用户账户 "{{.Labels.created_account_name}}" 已创建',
			body_template:
				"你好 {{.UserName}},\n\n新用户账户 **{{.Labels.created_account_name}}** 已创建。",
			actions:
				'[{"url": "{{ base_url }}/deployment/users?filter=status%3Aactive", "label": "查看账户"}]',
			group: "用户事件",
			method: "",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "0ea69165-ec14-4314-91f1-69566ac3c5a0",
			name: "工作区已标记为休眠",
			title_template: '工作区 "{{.Labels.name}}" 已标记为休眠',
			body_template:
				"你好 {{.UserName}}\n\n你的工作区 **{{.Labels.name}}** 因 {{.Labels.reason}} 已被标记为 [**休眠**](https://coder.com/docs/templates/schedule#dormancy-threshold-enterprise)。\n休眠工作区将在闲置 {{.Labels.timeTilDormant}} 后被 [自动删除](https://coder.com/docs/templates/schedule#dormancy-auto-deletion-enterprise)。\n要防止删除，请使用下方的链接访问你的工作区。",
			actions:
				'[{"url": "{{ base_url }}/@{{.UserUsername}}/{{.Labels.name}}", "label": "查看工作区"}]',
			group: "工作区事件",
			method: "smtp",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "c34a0c09-0704-4cac-bd1c-0c0146811c2b",
			name: "工作区已自动更新",
			title_template: '工作区 "{{.Labels.name}}" 已自动更新',
			body_template:
				"你好 {{.UserName}}\n你的工作区 **{{.Labels.name}}** 已自动更新到最新模板版本 ({{.Labels.template_version_name}})。",
			actions:
				'[{"url": "{{ base_url }}/@{{.UserUsername}}/{{.Labels.name}}", "label": "查看工作区"}]',
			group: "工作区事件",
			method: "smtp",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "51ce2fdf-c9ca-4be1-8d70-628674f9bc42",
			name: "工作区已标记为删除",
			title_template: '工作区 "{{.Labels.name}}" 已标记为删除',
			body_template:
				"你好 {{.UserName}}\n\n你的工作区 **{{.Labels.name}}** 在 [休眠](https://coder.com/docs/templates/schedule#dormancy-auto-deletion-enterprise) {{.Labels.timeTilDormant}} 后，因 {{.Labels.reason}} 已被标记为 **删除**。\n要防止删除，请使用下方的链接访问你的工作区。",
			actions:
				'[{"url": "{{ base_url }}/@{{.UserUsername}}/{{.Labels.name}}", "label": "查看工作区"}]',
			group: "工作区事件",
			method: "webhook",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "template-event-1",
			name: "模板版本已创建",
			title_template: '模板版本 "{{.Labels.version_name}}" 已创建',
			body_template:
				'你好 {{.UserName}}\n模板 "{{.Labels.template_name}}" 的一个新版本已创建。',
			actions:
				'[{"url": "{{ base_url }}/templates/{{.Labels.template_name}}", "label": "查看模板"}]',
			group: "模板事件",
			method: "smtp",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "template-event-2",
			name: "模板已更新",
			title_template: '模板 "{{.Labels.template_name}}" 已更新',
			body_template:
				'你好 {{.UserName}}\n模板 "{{.Labels.template_name}}" 已更新。',
			actions:
				'[{"url": "{{ base_url }}/templates/{{.Labels.template_name}}", "label": "查看模板"}]',
			group: "模板事件",
			method: "webhook",
			kind: "system",
			enabled_by_default: true,
		},
		{
			id: "8c5a4d12-9f7e-4b3a-a1c8-6e4f2d9b5a7c",
			name: "任务已完成",
			title_template: "任务 '{{.Labels.workspace}}' 已完成",
			body_template: "任务 '{{.Labels.task}}' 已成功完成。",
			actions:
				'[{"url": "{{base_url}}/tasks/{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看任务"}, {"url": "{{base_url}}/@{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看工作区"}]',
			group: "任务事件",
			method: "",
			kind: "system",
			enabled_by_default: false,
		},
		{
			id: "3b7e8f1a-4c2d-49a6-b5e9-7f3a1c8d6b4e",
			name: "任务失败",
			title_template: "任务 '{{.Labels.workspace}}' 失败",
			body_template:
				"任务 '{{.Labels.task}}' 失败。请检查日志以获取更多详细信息。",
			actions:
				'[{"url": "{{base_url}}/tasks/{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看任务"}, {"url": "{{base_url}}/@{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看工作区"}]',
			group: "任务事件",
			method: "",
			kind: "system",
			enabled_by_default: false,
		},
		{
			id: "d4a6271c-cced-4ed0-84ad-afd02a9c7799",
			name: "任务空闲",
			title_template: "任务 '{{.Labels.workspace}}' 空闲",
			body_template: "任务 '{{.Labels.task}}' 空闲，等待输入。",
			actions:
				'[{"url": "{{base_url}}/tasks/{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看任务"}, {"url": "{{base_url}}/@{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看工作区"}]',
			group: "任务事件",
			method: "",
			kind: "system",
			enabled_by_default: false,
		},
		{
			id: "bd4b7168-d05e-4e19-ad0f-3593b77aa90f",
			name: "任务工作中",
			title_template: "任务 '{{.Labels.workspace}}' 工作中",
			body_template: "任务 '{{.Labels.task}}' 已转为工作状态。",
			actions:
				'[{"url": "{{base_url}}/tasks/{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看任务"}, {"url": "{{base_url}}/@{{.UserUsername}}/{{.Labels.workspace}}", "label": "查看工作区"}]',
			group: "任务事件",
			method: "",
			kind: "system",
			enabled_by_default: false,
		},
		{
			id: "764031be-4863-4220-867b-6ce1a1b7a5f5",
			name: "聊天自动归档",
			title_template:
				"聊天在 {{.Data.auto_archive_days}} 天不活跃后自动归档",
			body_template:
				'以下聊天已被自动归档:\n\n{{range .Data.archived_chats}}* "{{.title}}" (最后活跃于 {{.last_activity_humanized}})\n{{end}}',
			actions:
				'[{"label": "查看聊天", "url": "{{base_url}}/agents?archived=archived"}]',
			group: "聊天事件",
			method: "",
			kind: "system",
			enabled_by_default: true,
		},
	];

export const MockCustomNotificationTemplates: TypesGen.NotificationTemplate[] =
	[
		{
			id: "39b1e189-c857-4b0c-877a-511144c18516",
			name: "自定义通知",
			title_template: "{{.Labels.custom_title}}",
			body_template: "{{.Labels.custom_message}}",
			actions: "[]",
			group: "自定义事件",
			method: "",
			kind: "custom",
			enabled_by_default: true,
		},
	];

export const MockNotificationMethodsResponse: TypesGen.NotificationMethodsResponse =
	{ available: ["smtp", "webhook"], default: "smtp" };

export const MockNotification: TypesGen.InboxNotification = {
	id: "1",
	read_at: null,
	content:
		"新用户账户 testuser 已创建。这个新用户账户是由 Kira Pilot 为测试用户创建的。",
	created_at: mockTwoDaysAgo(),
	actions: [
		{
			label: "查看模板",
			url: "https://dev.coder.com/templates/coder/coder",
		},
	],
	user_id: MockUserOwner.id,
	template_id: MockTemplate.id,
	targets: [],
	title: "用户账户已创建",
	icon: "DEFAULT_ICON_ACCOUNT",
};

export const MockNotifications: TypesGen.InboxNotification[] = [
	MockNotification,
	{ ...MockNotification, id: "2", read_at: null },
	{ ...MockNotification, id: "3", read_at: mockTwoDaysAgo() },
	{ ...MockNotification, id: "4", read_at: mockTwoDaysAgo() },
	{ ...MockNotification, id: "5", read_at: mockTwoDaysAgo() },
];

function mockTwoDaysAgo() {
	const date = new Date();
	date.setDate(date.getDate() - 2);
	return date.toISOString();
}

export const MockWorkspaceAgentContainerPorts: TypesGen.WorkspaceAgentContainerPort[] =
	[
		{
			port: 1000,
			network: "tcp",
			host_port: 1000,
			host_ip: "0.0.0.0",
		},
		{
			port: 2001,
			network: "tcp",
			host_port: 2000,
			host_ip: "::1",
		},
		{
			port: 8888,
			network: "tcp",
		},
	];

export const MockWorkspaceAgentContainer: TypesGen.WorkspaceAgentContainer = {
	created_at: "2024-01-04T15:53:03.21563Z",
	id: "abcd1234",
	name: "container-1",
	image: "ubuntu:latest",
	labels: {
		foo: "bar",
	},
	ports: [],
	running: true,
	status: "running",
	volumes: {
		"/mnt/volume1": "/volume1",
	},
};

export const MockWorkspaceAgentDevcontainer: TypesGen.WorkspaceAgentDevcontainer =
	{
		id: "test-devcontainer-id",
		name: "test-devcontainer",
		workspace_folder: "/workspace/test",
		config_path: "/workspace/test/.devcontainer/devcontainer.json",
		status: "running",
		dirty: false,
		container: MockWorkspaceAgentContainer,
		agent: {
			id: MockWorkspaceSubAgent.id,
			name: MockWorkspaceSubAgent.name,
			directory: MockWorkspaceSubAgent?.directory ?? "/workspace/test",
		},
	};

export const MockWorkspaceAppStatuses: TypesGen.WorkspaceAppStatus[] = [
	{
		// 这是时间顺序上最新的状态 (15:04:38)
		...MockWorkspaceAppStatus,
		id: "status-7",
		icon: "/emojis/1f4dd.png", // 📝
		message: "正在使用 gh CLI 创建 PR",
		created_at: createTimestamp(4, 38), // 15:04:38
		uri: "https://github.com/coder/coder/pull/5678",
		state: "complete" as const,
	},
	{
		// (15:03:56)
		...MockWorkspaceAppStatus,
		id: "status-6",
		icon: "/emojis/1f680.png", // 🚀
		message: "正在推送分支到远程仓库",
		created_at: createTimestamp(3, 56), // 15:03:56
		uri: "",
		state: "complete" as const,
	},
	{
		// (15:02:29)
		...MockWorkspaceAppStatus,
		id: "status-5",
		icon: "/emojis/1f527.png", // 🔧
		message: "正在配置 git 身份",
		created_at: createTimestamp(2, 29), // 15:02:29
		uri: "",
		state: "complete" as const,
	},
	{
		// (15:02:04)
		...MockWorkspaceAppStatus,
		id: "status-4",
		icon: "/emojis/1f4be.png", // 💾
		message: "正在提交更改",
		created_at: createTimestamp(2, 4), // 15:02:04
		uri: "",
		state: "complete" as const,
	},
	{
		// (15:01:44)
		...MockWorkspaceAppStatus,
		id: "status-3",
		icon: "/emojis/2795.png", // +
		message: "正在将文件添加到暂存区",
		created_at: createTimestamp(1, 44), // 15:01:44
		uri: "",
		state: "complete" as const,
	},
	{
		// (15:01:32)
		...MockWorkspaceAppStatus,
		id: "status-2",
		icon: "/emojis/1f33f.png", // 🌿
		message: "正在为 PR 创建新分支",
		created_at: createTimestamp(1, 32), // 15:01:32
		uri: "",
		state: "complete" as const,
	},
	{
		// (15:01:00) - 最早
		...MockWorkspaceAppStatus,
		id: "status-1",
		icon: "/emojis/1f680.png", // 🚀
		message: "正在开始创建 PR",
		created_at: createTimestamp(1, 0), // 15:01:00
		uri: "",
		state: "complete" as const,
	},
];

export function createTimestamp(minuteOffset: number, secondOffset: number) {
	const baseDate = new Date("2024-03-26T15:00:00Z");
	baseDate.setMinutes(baseDate.getMinutes() + minuteOffset);
	baseDate.setSeconds(baseDate.getSeconds() + secondOffset);
	return baseDate.toISOString();
}

// AI 任务的模拟预设
export const MockPresets: TypesGen.Preset[] = [
	{
		ID: "preset-1",
		Name: "开发",
		Description: "",
		Icon: "",
		Parameters: [
			{ Name: "cpu", Value: "4" },
			{ Name: "memory", Value: "8GB" },
		],
		Default: true,
		DesiredPrebuildInstances: 0,
	},
	{
		ID: "preset-2",
		Name: "测试",
		Description: "",
		Icon: "",
		Parameters: [
			{ Name: "cpu", Value: "2" },
			{ Name: "memory", Value: "4GB" },
		],
		Default: false,
		DesiredPrebuildInstances: 0,
	},
	{
		ID: "preset-3",
		Name: "生产",
		Description: "",
		Icon: "",
		Parameters: [
			{ Name: "cpu", Value: "8" },
			{ Name: "memory", Value: "16GB" },
		],
		Default: false,
		DesiredPrebuildInstances: 0,
	},
];

export const MockTaskPresets: TypesGen.Preset[] = [
	{
		ID: "ai-preset-1",
		Name: "代码审查",
		Description: "",
		Icon: "",
		Parameters: [
			{ Name: "cpu", Value: "4" },
			{ Name: "memory", Value: "8GB" },
		],
		Default: true,
		DesiredPrebuildInstances: 0,
	},
	{
		ID: "ai-preset-2",
		Name: "自定义提示",
		Description: "",
		Icon: "",
		Parameters: [
			{ Name: "cpu", Value: "4" },
			{ Name: "memory", Value: "8GB" },
		],
		Default: false,
		DesiredPrebuildInstances: 0,
	},
];

export const MockTask = {
	id: "test-task",
	name: "perform-some-task-123",
	display_name: "执行某个任务",
	organization_id: MockOrganization.id,
	owner_id: MockUserOwner.id,
	owner_name: MockUserOwner.username,
	owner_avatar_url: MockUserOwner.avatar_url,
	template_id: MockTemplate.id,
	template_name: MockTemplate.name,
	template_display_name: MockTemplate.display_name,
	template_icon: MockTemplate.icon,
	template_version_id: MockTemplateVersion.id,
	workspace_id: MockWorkspace.id,
	workspace_name: MockWorkspace.name,
	workspace_status: "running",
	workspace_build_number: MockWorkspaceBuild.build_number,
	workspace_agent_id: MockWorkspaceAgent.id,
	workspace_agent_lifecycle: MockWorkspaceAgent.lifecycle_state,
	workspace_agent_health: MockWorkspaceAgent.health,
	workspace_app_id: MockWorkspaceApp.id,
	initial_prompt: "执行某个任务",
	status: "active",
	current_state: {
		timestamp: "2022-05-17T17:39:01.382927298Z",
		state: "idle",
		message: "我应该继续吗？",
		uri: "https://dev.coder.com",
	},
	created_at: "2022-05-17T17:39:01.382927298Z",
	updated_at: "2022-05-17T17:39:01.382927298Z",
} satisfies TypesGen.Task;

export const MockTaskWorkspace: TypesGen.Workspace = {
	...MockWorkspace,
	task_id: MockTask.id,
};

export const MockTasks = [
	MockTask,
	{
		...MockTask,
		id: "task-2",
		name: "fix-avatar-size",
		display_name: "修复头像大小",
		current_state: {
			...MockTask.current_state,
			message: "头像大小已修复！",
			state: "complete",
		},
	},
	{
		...MockTask,
		id: "task-3",
		name: "fix-accessibility-issues",
		display_name: "修复无障碍问题",
		current_state: {
			...MockTask.current_state,
			message: "无障碍问题已修复！",
			state: "complete",
		},
	},
] satisfies TypesGen.Task[];

export const MockInitializingTasks = [
	{
		...MockTask,
		id: "task-1",
		name: "workspace-pending",
		display_name: "工作区等待中",
		initial_prompt: "任务工作区等待中",
		status: "initializing",
		current_state: {
			timestamp: new Date().toISOString(),
			state: "working",
			message: "工作区正在等待",
			uri: "",
		},
	},
	{
		...MockTask,
		id: "task-2",
		name: "workspace-starting",
		display_name: "工作区启动中",
		initial_prompt: "任务工作区启动中",
		status: "initializing",
		current_state: {
			timestamp: new Date().toISOString(),
			state: "working",
			message: "工作区正在启动",
			uri: "",
		},
	},
	{
		...MockTask,
		id: "task-3",
		name: "agent-connecting",
		display_name: "代理连接中",
		initial_prompt: "任务代理连接中",
		status: "initializing",
		current_state: {
			timestamp: new Date().toISOString(),
			state: "working",
			message: "代理正在连接",
			uri: "",
		},
	},
	{
		...MockTask,
		id: "task-4",
		name: "agent-starting",
		display_name: "代理启动中",
		initial_prompt: "任务代理启动中",
		status: "initializing",
		current_state: {
			timestamp: new Date().toISOString(),
			state: "working",
			message: "代理正在启动",
			uri: "",
		},
	},
	{
		...MockTask,
		id: "task-5",
		name: "app-initializing",
		display_name: "应用初始化中",
		initial_prompt: "任务应用初始化中",
		status: "initializing",
		current_state: {
			timestamp: new Date().toISOString(),
			state: "working",
			message: "应用正在初始化",
			uri: "",
		},
	},
] satisfies TypesGen.Task[];

export const MockDisplayNameTasks = [
	{
		...MockTask,
	},
	{
		...MockTask,
		id: "task-4",
		name: "validate-email-regex",
		// 带有省略号的 64 个字符的显示名称
		display_name:
			"编写一个函数，使用正则表达式验证电子邮件地址…",
		current_state: {
			...MockTask.current_state,
			message: "电子邮件验证完成！",
			state: "complete",
		},
	},
	{
		...MockTask,
		id: "payment-api-tests",
		name: "payment-api-tests",
		// 81 个字符的显示名称
		display_name:
			"为新的支付处理微服务 API 创建全面的测试套件",
		current_state: {
			...MockTask.current_state,
			message: "测试套件已创建！",
			state: "complete",
		},
	},
] satisfies TypesGen.Task[];

export const MockInterception: TypesGen.AIBridgeInterception = {
	id: "5c1da48a-9eb0-440e-9c82-5bc5692a603d",
	initiator: {
		id: "1ebb7622-e6ea-45b4-b244-dda30afc7238",
		username: "testuser",
		avatar_url: "https://example.com/avatar.png",
	},
	provider: "openai",
	provider_name: "openai",
	model: "gpt-4o",
	started_at: "2022-05-17T17:39:01.382927298Z",
	ended_at: "2022-05-17T17:39:01.382927298Z",
	token_usages: [
		{
			id: "32e7fd17-24be-46b9-b867-2f0adfd42aff",
			interception_id: "5c1da48a-9eb0-440e-9c82-5bc5692a603d",
			provider_response_id: "res_1234567890",
			input_tokens: 5,
			output_tokens: 1,
			cache_read_input_tokens: 3,
			cache_write_input_tokens: 1,
			metadata: {},
			created_at: "2022-05-17T17:39:01.382927298Z",
		},
	],
	metadata: {},
	user_prompts: [
		{
			id: "85154044-818e-4ee4-bac2-87f3ac8f066b",
			interception_id: "5c1da48a-9eb0-440e-9c82-5bc5692a603d",
			provider_response_id: "res_1234567890",
			prompt: "Hello OpenAI",
			metadata: {},
			created_at: "2022-05-17T17:39:01.382927298Z",
		},
	],
	tool_usages: [],
	api_key_id: "5c1da48a-9eb0-440e-9c82-5bc5692a603d",
	client: "Claude Code",
};

export const MockInterceptionAnthropic: TypesGen.AIBridgeInterception = {
	...MockInterception,
	id: "e5610f5b-2d6c-43db-b1c0-1dfcc6531f04",
	provider: "anthropic",
	model: "claude-sonnet-4.5",
	user_prompts: [
		{
			id: "c820f31f-0170-4044-8b7c-b1b18747b4fb",
			interception_id: "e5610f5b-2d6c-43db-b1c0-1dfcc6531f04",
			provider_response_id: "res_2345678901",
			prompt: "Hello Anthropic",
			metadata: {},
			created_at: "2022-05-17T17:39:01.382927298Z",
		},
	],
};

export const MockInterceptionCopilot: TypesGen.AIBridgeInterception = {
	...MockInterception,
	id: "22c9d31e-1a1f-464a-b397-562958599aa8",
	provider: "copilot",
	model: "claude-opus-4-5",
	user_prompts: [
		{
			id: "c6c613d1-177e-416f-95b5-c7f0eeefb922",
			interception_id: "22c9d31e-1a1f-464a-b397-562958599aa8",
			provider_response_id: "res_3456789012",
			prompt: "Hello Copilot",
			metadata: {},
			created_at: "2022-05-17T17:39:01.382927298Z",
		},
	],
};

export const MockSession: TypesGen.AIBridgeSession = {
	id: "c8f2df8c-149c-43e1-9d51-898daaa2c505",
	initiator: {
		id: "59da0bfe-9c99-47fa-a563-f9fdb18449d0",
		username: "bob",
		name: "建造者 Bob",
		avatar_url:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeDqc5b7Ny5bJOKxDeFvy17kBQ2_ZmBE8vKw&s",
	},
	providers: ["anthropic", "openai"],
	models: ["claude-opus-4-6", "gpt-5.4"],
	client: "Mux",
	metadata: {
		request_user_agent:
			"mux/0.20.1-next.8.g0f494106 ai-sdk/anthropic/3.0.58 ai-sdk/provider-utils/4.0.19 runtime/node.js/22",
	},
	started_at: "2026-03-09T09:28:15.03152Z",
	ended_at: "2026-03-09T10:28:17.294897Z",
	threads: 17,
	token_usage_summary: {
		input_tokens: 1234,
		output_tokens: 4321,
		cache_read_input_tokens: 980,
		cache_write_input_tokens: 120,
	},
	last_prompt: "但我真的能修好它吗？",
	last_active_at: "2026-03-09T10:28:15.03152Z",
};

export const MockAIProviderOpenAI: TypesGen.AIProvider = {
	id: "7a5d6b6a-5f02-4a9c-9c4e-2b3e2a3d2f01",
	type: "openai",
	name: "openai",
	display_name: "OpenAI",
	base_url: "https://api.openai.com",
	enabled: false,
	api_keys: [
		{
			id: "6d7c1f3a-1f0b-4a12-a1b5-0fb1f8e72e01",
			masked: "sk-***\u2026***ABCD",
			created_at: "2026-05-14T10:00:00Z",
		},
	],
	settings: null as unknown as TypesGen.AIProviderSettings,
	created_at: "2026-05-14T10:00:00Z",
	updated_at: "2026-05-14T10:00:00Z",
};

export const MockAIProviderAnthropic: TypesGen.AIProvider = {
	id: "4f81f1ee-37c1-4a37-a9d5-7e0c1c8c0c11",
	type: "anthropic",
	name: "anthropic",
	display_name: "Anthropic",
	base_url: "https://api.anthropic.com",
	enabled: false,
	api_keys: [],
	settings: null as unknown as TypesGen.AIProviderSettings,
	created_at: "2026-05-14T10:00:00Z",
	updated_at: "2026-05-14T10:00:00Z",
};

/**
 * Bedrock 提供程序通过 `type: "anthropic"` 和 `settings._type: "bedrock"` 鉴别器进行传递。
 * `isBedrockProvider` 和后端（参见 `coderd/ai_providers.go`）强制执行此约定。
 */
export const MockAIProviderBedrock: TypesGen.AIProvider = {
	id: "9c2e3b41-2e9f-4c97-9a4f-2e1a3d8f9f21",
	type: "anthropic",
	name: "bedrock",
	display_name: "Bedrock",
	base_url: "https://bedrock-runtime.us-east-2.amazonaws.com",
	enabled: true,
	api_keys: [],
	settings: {
		_type: "bedrock",
		_version: 1,
		region: "us-east-2",
		model: "anthropic.claude-opus-4-7",
		small_fast_model: "anthropic.claude-haiku-4-5",
	} as unknown as TypesGen.AIProviderSettings,
	created_at: "2026-05-14T10:00:00Z",
	updated_at: "2026-05-14T10:00:00Z",
};

export const MockAIProviderCopilot: TypesGen.AIProvider = {
	id: "b3f0d2c8-6a4e-4d11-8c2f-1e9a7c5b4d31",
	type: "copilot",
	name: "copilot",
	display_name: "GitHub Copilot",
	base_url: "https://api.business.githubcopilot.com",
	enabled: true,
	api_keys: [],
	settings: null as unknown as TypesGen.AIProviderSettings,
	created_at: "2026-05-14T10:00:00Z",
	updated_at: "2026-05-14T10:00:00Z",
};

export const MockAIProviders: TypesGen.AIProvider[] = [
	MockAIProviderOpenAI,
	MockAIProviderAnthropic,
	MockAIProviderBedrock,
	MockAIProviderCopilot,
];
