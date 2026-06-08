import type { FC } from "react";
import type { UseMutateFunction } from "react-query";
import type * as TypesGen from "#/api/typesGenerated";
import { ChatFullWidthSettings } from "./components/ChatFullWidthSettings";
import { ChatSendShortcutSettings } from "./components/ChatSendShortcutSettings";
import {
	CodeDiffDisplaySettings,
	ShellToolDisplaySettings,
	ThinkingDisplaySettings,
} from "./components/DisplayModeSettings";
import { PersonalInstructionsSettings } from "./components/PersonalInstructionsSettings";
import { SectionHeader } from "./components/SectionHeader";
import { UserChatDebugLoggingSettings } from "./components/UserChatDebugLoggingSettings";

export interface AgentSettingsGeneralPageViewProps {
	userPromptData: TypesGen.UserChatCustomPrompt | undefined;
	onSaveUserPrompt: UseMutateFunction<
		TypesGen.UserChatCustomPrompt,
		Error,
		TypesGen.UserChatCustomPrompt,
		unknown
	>;
	isSavingUserPrompt: boolean;
	isSaveUserPromptError: boolean;
	userDebugLoggingData: TypesGen.UserChatDebugLoggingSettings | undefined;
	onSaveUserDebugLogging: UseMutateFunction<
		void,
		Error,
		TypesGen.UpdateUserChatDebugLoggingRequest,
		unknown
	>;
	isSavingUserDebugLogging: boolean;
	isSaveUserDebugLoggingError: boolean;
}

export const AgentSettingsGeneralPageView: FC<
	AgentSettingsGeneralPageViewProps
> = ({
	userPromptData,
	onSaveUserPrompt,
	isSavingUserPrompt,
	isSaveUserPromptError,
	userDebugLoggingData,
	onSaveUserDebugLogging,
	isSavingUserDebugLogging,
	isSaveUserDebugLoggingError,
}) => {
	return (
		<div className="flex flex-col gap-8">
			<SectionHeader
				label="通用"
				description="聊天体验的个人偏好设置。"
			/>
			<PersonalInstructionsSettings
				userPromptData={userPromptData}
				onSaveUserPrompt={onSaveUserPrompt}
				isSavingUserPrompt={isSavingUserPrompt}
				isSaveUserPromptError={isSaveUserPromptError}
				isAnyPromptSaving={isSavingUserPrompt}
			/>
			<ChatFullWidthSettings />
			<ChatSendShortcutSettings />
			<ThinkingDisplaySettings />
			<ShellToolDisplaySettings />
			<CodeDiffDisplaySettings />
			<UserChatDebugLoggingSettings
				userSettings={userDebugLoggingData}
				onSaveUserSetting={onSaveUserDebugLogging}
				isSavingUserSetting={isSavingUserDebugLogging}
				isSaveUserSettingError={isSaveUserDebugLoggingError}
			/>
		</div>
	);
};
