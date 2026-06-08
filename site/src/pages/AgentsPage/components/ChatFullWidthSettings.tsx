import type { FC } from "react";
import { Switch } from "#/components/Switch/Switch";
import { useChatFullWidth } from "../hooks/useChatFullWidth";

export const ChatFullWidthSettings: FC = () => {
	const [enabled, setEnabled] = useChatFullWidth();

	return (
		<div className="flex flex-col gap-2">
			<h3 className="m-0 text-sm font-semibold text-content-primary">
				聊天布局
			</h3>
			<div className="flex items-center justify-between gap-4">
				<p className="m-0 flex-1 text-xs text-content-secondary">
					为智能体聊天消息使用全宽布局，移除默认的最大宽度限制。
				</p>
				<Switch
					checked={enabled}
					onCheckedChange={(checked) => setEnabled(Boolean(checked))}
					aria-label="全宽聊天"
				/>
			</div>
		</div>
	);
};
