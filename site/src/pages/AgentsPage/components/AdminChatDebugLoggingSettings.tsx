import type { FC } from "react";
import type { UseMutateFunction } from "react-query";
import type * as TypesGen from "#/api/typesGenerated";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { Switch } from "#/components/Switch/Switch";

interface AdminChatDebugLoggingSettingsProps {
	adminSettings: TypesGen.ChatDebugLoggingAdminSettings | undefined;
	isLoadingAdminSetting: boolean;
	onSaveAdminSetting: UseMutateFunction<
		void,
		Error,
		TypesGen.UpdateChatDebugLoggingAllowUsersRequest,
		unknown
	>;
	isSavingAdminSetting: boolean;
	isSaveAdminSettingError: boolean;
}

export const AdminChatDebugLoggingSettings: FC<
	AdminChatDebugLoggingSettingsProps
> = ({
	adminSettings,
	isLoadingAdminSetting,
	onSaveAdminSetting,
	isSavingAdminSetting,
	isSaveAdminSettingError,
}) => {
	const forcedByDeployment = adminSettings?.forced_by_deployment ?? false;
	const adminAllowsUsers = adminSettings?.allow_users ?? false;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<h3 className="m-0 text-sm font-semibold text-content-primary">
					允许用户记录聊天调试日志
				</h3>
			</div>
			<div className="flex items-center justify-between gap-4">
				<div className="!mt-0.5 m-0 flex-1 text-xs text-content-secondary">
					{forcedByDeployment ? (
						<p className="m-0">
							调试日志已在部署范围启用，因此此每用户设置目前无效。
						</p>
					) : (
						<p className="m-0">
							允许用户从他们的常规设置中为自己的聊天开启调试日志。开启后，Coder 会保存每次对话轮次以及发送给模型提供商的原始 API 请求和响应。
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">
					{isLoadingAdminSetting ? (
						<Skeleton className="h-5 w-10 rounded-full" aria-hidden="true" />
					) : (
						<Switch
							checked={adminAllowsUsers}
							onCheckedChange={(checked) =>
								onSaveAdminSetting({ allow_users: checked })
							}
							aria-label="允许用户启用聊天调试日志"
							disabled={
								forcedByDeployment ||
								isSavingAdminSetting ||
								isLoadingAdminSetting
							}
						/>
					)}
				</div>
			</div>
			{isSaveAdminSettingError && (
				<p className="m-0 text-xs text-content-destructive">
					保存管理员调试日志设置失败。
				</p>
			)}
		</div>
	);
};
