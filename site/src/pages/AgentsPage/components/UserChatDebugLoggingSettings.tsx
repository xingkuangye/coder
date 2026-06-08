import type { FC } from "react";
import type { UseMutateFunction } from "react-query";
import type * as TypesGen from "#/api/typesGenerated";
import { Switch } from "#/components/Switch/Switch";

interface UserChatDebugLoggingSettingsProps {
	userSettings: TypesGen.UserChatDebugLoggingSettings | undefined;
	onSaveUserSetting: UseMutateFunction<
		void,
		Error,
		TypesGen.UpdateUserChatDebugLoggingRequest,
		unknown
	>;
	isSavingUserSetting: boolean;
	isSaveUserSettingError: boolean;
}

export const UserChatDebugLoggingSettings: FC<
	UserChatDebugLoggingSettingsProps
> = ({
	userSettings,
	onSaveUserSetting,
	isSavingUserSetting,
	isSaveUserSettingError,
}) => {
	if (!userSettings?.user_toggle_allowed) {
		return null;
	}

	const forcedByDeployment = userSettings.forced_by_deployment;
	const userDebugLoggingEnabled = userSettings.debug_logging_enabled;

	return (
		<div className="space-y-2">
			<h3 className="m-0 text-sm font-semibold text-content-primary">
				为我的聊天记录调试日志
			</h3>
			<div className="flex items-center justify-between gap-4">
				<div className="!mt-0.5 m-0 flex-1 text-xs text-content-secondary">
					{forcedByDeployment ? (
						<p className="m-0">
							管理员已为此部署中的每个聊天启用了调试日志记录，因此此开关被锁定为开启状态。
						</p>
					) : (
						<p className="m-0">
							保存聊天的详细跟踪信息：包含每次对话轮次以及发送给模型提供商的原始 API 请求和响应。有助于排查意外的模型行为。
						</p>
					)}
				</div>
				<Switch
					checked={forcedByDeployment || userDebugLoggingEnabled}
					onCheckedChange={(checked) =>
						onSaveUserSetting({ debug_logging_enabled: checked })
					}
					aria-label="启用个人聊天调试日志记录"
					disabled={forcedByDeployment || isSavingUserSetting}
				/>
			</div>
			{isSaveUserSettingError && (
				<p className="m-0 text-xs text-content-destructive">
					保存聊天调试日志记录偏好设置失败。
				</p>
			)}
		</div>
	);
};
