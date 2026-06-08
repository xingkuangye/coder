import type { Meta } from "@storybook/react-vite";
import {
	customNotificationTemplatesKey,
	notificationDispatchMethodsKey,
	systemNotificationTemplatesKey,
} from "#/api/queries/notifications";
import type { DeploymentValues, SerpentOption } from "#/api/typesGenerated";
import {
	MockCustomNotificationTemplates,
	MockNotificationMethodsResponse,
	MockSystemNotificationTemplates,
	MockUserOwner,
} from "#/testHelpers/entities";
import {
	withAuthProvider,
	withDashboardProvider,
	withOrganizationSettingsProvider,
	withToaster,
} from "#/testHelpers/storybook";
import type NotificationsPage from "./NotificationsPage";

// Extracted from a real API response
const mockNotificationsDeploymentOptions: SerpentOption[] = [
	{
		name: "通知: 分发超时",
		description:
			"在放弃之前等待通知发送的时间长度。",
		flag: "notifications-dispatch-timeout",
		env: "CODER_NOTIFICATIONS_DISPATCH_TIMEOUT",
		yaml: "dispatchTimeout",
		default: "1m0s",
		value: 60000000000,
		annotations: {
			format_duration: "true",
		},
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		value_source: "default",
	},
	{
		name: "通知: 拉取间隔",
		description: "查询数据库中排队通知的频率。",
		flag: "notifications-fetch-interval",
		env: "CODER_NOTIFICATIONS_FETCH_INTERVAL",
		yaml: "fetchInterval",
		default: "15s",
		value: 15000000000,
		annotations: {
			format_duration: "true",
		},
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
	{
		name: "通知: 租约数量",
		description:
			"每个拉取间隔通知程序应租约的通知数量。",
		flag: "notifications-lease-count",
		env: "CODER_NOTIFICATIONS_LEASE_COUNT",
		yaml: "leaseCount",
		default: "20",
		value: 20,
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
	{
		name: "通知: 租约周期",
		description:
			"通知程序应租约一条消息的时间长度。这实际上是通知被通知程序“拥有”的时长，一旦此周期过期，该消息将可供其他通知程序租用。租约对于确保多个正在运行的通知程序不会同时选择相同的消息进行传递非常重要。此租约周期仅在通知程序非正常关闭时才会过期；通知的分发会释放租约。",
		flag: "notifications-lease-period",
		env: "CODER_NOTIFICATIONS_LEASE_PERIOD",
		yaml: "leasePeriod",
		default: "2m0s",
		value: 120000000000,
		annotations: {
			format_duration: "true",
		},
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
	{
		name: "通知: 最大发送尝试次数",
		description: "发送通知的尝试次数上限。",
		flag: "notifications-max-send-attempts",
		env: "CODER_NOTIFICATIONS_MAX_SEND_ATTEMPTS",
		yaml: "maxSendAttempts",
		default: "5",
		value: 5,
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		value_source: "default",
	},
	{
		name: "通知: 方法",
		description:
			"使用哪种传递方法（可用选项：'smtp'、'webhook'）。",
		flag: "notifications-method",
		env: "CODER_NOTIFICATIONS_METHOD",
		yaml: "method",
		default: "smtp",
		value: "smtp",
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		value_source: "env",
	},
	{
		name: "通知: 重试间隔",
		description: "重试之间的最小时间间隔。",
		flag: "notifications-retry-interval",
		env: "CODER_NOTIFICATIONS_RETRY_INTERVAL",
		yaml: "retryInterval",
		default: "5m0s",
		value: 300000000000,
		annotations: {
			format_duration: "true",
		},
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
	{
		name: "通知: 存储同步缓冲区大小",
		description:
			"通知系统在内存中缓冲消息更新以减轻数据库压力。此选项控制内存中保留多少更新。此值越低，非正常关闭时状态不一致的可能性越小，但也会增加数据库负载。建议保持此选项为默认值。",
		flag: "notifications-store-sync-buffer-size",
		env: "CODER_NOTIFICATIONS_STORE_SYNC_BUFFER_SIZE",
		yaml: "storeSyncBufferSize",
		default: "50",
		value: 50,
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
	{
		name: "通知: 存储同步间隔",
		description:
			"通知系统在内存中缓冲消息更新以减轻数据库压力。此选项控制其状态与数据库同步的频率。此值越短，非正常关闭时状态不一致的可能性越小，但也会增加数据库负载。建议保持此选项为默认值。",
		flag: "notifications-store-sync-interval",
		env: "CODER_NOTIFICATIONS_STORE_SYNC_INTERVAL",
		yaml: "storeSyncInterval",
		default: "2s",
		value: 2000000000,
		annotations: {
			format_duration: "true",
		},
		group: {
			name: "通知",
			yaml: "notifications",
			description: "配置通知的处理和传递方式。",
		},
		hidden: true,
		value_source: "default",
	},
];

export const baseMeta = {
	parameters: {
		experiments: ["notifications"],
		queries: [
			{
				key: systemNotificationTemplatesKey,
				data: MockSystemNotificationTemplates,
			},
			{
				key: customNotificationTemplatesKey,
				data: MockCustomNotificationTemplates,
			},
			{
				key: notificationDispatchMethodsKey,
				data: MockNotificationMethodsResponse,
			},
		],
		user: MockUserOwner,
		permissions: { viewDeploymentConfig: true },
		deploymentOptions: mockNotificationsDeploymentOptions,
		deploymentValues: {
			notifications: {
				webhook: {
					endpoint: "https://example.com",
				},
				email: {
					smarthost: "smtp.example.com",
					from: "bob@localhost",
					hello: "localhost",
				},
			},
		} as DeploymentValues,
	},
	decorators: [
		withToaster,
		withAuthProvider,
		withDashboardProvider,
		withOrganizationSettingsProvider,
	],
} satisfies Meta<typeof NotificationsPage>;
