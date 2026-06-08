import { type FC, useId } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
	preferenceSettings,
	updatePreferenceSettings,
} from "#/api/queries/users";
import { Switch } from "#/components/Switch/Switch";
import {
	DEFAULT_AGENT_CHAT_SEND_SHORTCUT,
	MODIFIER_AGENT_CHAT_SEND_SHORTCUT,
} from "../utils/agentChatSendShortcut";

export const ChatSendShortcutSettings: FC = () => {
	const queryClient = useQueryClient();
	const query = useQuery(preferenceSettings());
	const mutation = useMutation(updatePreferenceSettings(queryClient));
	const descriptionId = useId();
	const shortcut =
		query.data?.agent_chat_send_shortcut ?? DEFAULT_AGENT_CHAT_SEND_SHORTCUT;
	const requiresModifierEnter = shortcut === MODIFIER_AGENT_CHAT_SEND_SHORTCUT;

	return (
		<div className="flex flex-col gap-2">
			<h3 className="m-0 text-sm font-semibold text-content-primary">
				键盘快捷键
			</h3>
			<div className="flex items-center justify-between gap-4">
				<p
					id={descriptionId}
					className="m-0 flex-1 text-xs text-content-secondary"
				>
					要求使用 Cmd/Ctrl+Enter 发送智能体消息。启用后，Enter 键将插入换行符。
				</p>
				<Switch
					checked={requiresModifierEnter}
					onCheckedChange={(checked) =>
						mutation.mutate({
							agent_chat_send_shortcut: checked
								? MODIFIER_AGENT_CHAT_SEND_SHORTCUT
								: DEFAULT_AGENT_CHAT_SEND_SHORTCUT,
						})
					}
					aria-label="要求使用 Cmd/Ctrl+Enter 发送消息"
					aria-describedby={descriptionId}
					disabled={query.isLoading || !query.data || mutation.isPending}
				/>
			</div>
			{mutation.isError && (
				<p className="m-0 text-xs text-content-destructive">
					无法保存您的键盘快捷键偏好设置。
				</p>
			)}
		</div>
	);
};

