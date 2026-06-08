import type { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
	preferenceSettings,
	updatePreferenceSettings,
} from "#/api/queries/users";
import type {
	UpdateUserPreferenceSettingsRequest,
	UserPreferenceSettings,
} from "#/api/typesGenerated";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";

type DisplayModeOption<T extends string> = { value: T; label: string };

type ThinkingDisplayMode = UserPreferenceSettings["thinking_display_mode"];
type AgentDisplayMode = UserPreferenceSettings["code_diff_display_mode"];

const thinkingDisplayOptions: DisplayModeOption<ThinkingDisplayMode>[] = [
	{ value: "auto", label: "自动" },
	{ value: "preview", label: "预览" },
	{ value: "always_expanded", label: "始终展开" },
	{ value: "always_collapsed", label: "始终折叠" },
];

const agentDisplayOptions: DisplayModeOption<AgentDisplayMode>[] = [
	{ value: "auto", label: "自动" },
	{ value: "always_expanded", label: "始终展开" },
	{ value: "always_collapsed", label: "始终折叠" },
];

type DisplayModeSettingsProps<T extends string> = {
	title: string;
	description: string;
	ariaLabel: string;
	errorMessage: string;
	defaultValue: T;
	options: DisplayModeOption<T>[];
	getMode: (settings: UserPreferenceSettings) => T;
	updateSettings: (value: T) => UpdateUserPreferenceSettingsRequest;
};

const DisplayModeSettings = <T extends string>({
	title,
	description,
	ariaLabel,
	errorMessage,
	defaultValue,
	options,
	getMode,
	updateSettings,
}: DisplayModeSettingsProps<T>) => {
	const queryClient = useQueryClient();
	const query = useQuery(preferenceSettings());
	const mutation = useMutation(updatePreferenceSettings(queryClient));

	const mode = query.data ? getMode(query.data) : defaultValue;

	return (
		<div className="flex flex-col gap-2">
			<h3 className="m-0 text-sm font-semibold text-content-primary">
				{title}
			</h3>
			<div className="flex items-center justify-between gap-4">
				<p className="m-0 flex-1 text-xs text-content-secondary">
					{description}
				</p>
				<Select
					value={mode}
					disabled={query.isLoading || !query.data}
					onValueChange={(value: string) => {
						const selected = options.find((opt) => opt.value === value);
						if (!query.data || !selected) return;
						mutation.mutate(updateSettings(selected.value));
					}}
				>
					<SelectTrigger className="w-44 shrink-0" aria-label={ariaLabel}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{options.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{mutation.isError && (
				<p className="m-0 text-xs text-content-destructive">{errorMessage}</p>
			)}
		</div>
	);
};

export const ThinkingDisplaySettings: FC = () => {
	return (
		<DisplayModeSettings
			title="推理过程显示"
			description="设置推理块默认如何显示。“自动”在流式输出期间完全展开，完成后自动折叠。“预览”在流式输出期间自动展开并限制高度。“始终展开”始终显示完整内容。“始终折叠”始终保持折叠。"
			ariaLabel="推理过程显示模式"
			errorMessage="保存推理显示偏好失败。"
			defaultValue="auto"
			options={thinkingDisplayOptions}
			getMode={(settings) => settings.thinking_display_mode}
			updateSettings={(value) => ({
				thinking_display_mode: value,
			})}
		/>
	);
};

export const ShellToolDisplaySettings: FC = () => {
	return (
		<DisplayModeSettings
			title="Shell 输出显示"
			description="设置 shell 命令输出默认如何显示。“自动”会展开正在运行的命令和有输出的已完成命令，无输出时保持折叠。“始终展开”默认展开 shell 输出。“始终折叠”保持折叠。"
			ariaLabel="Shell 输出显示模式"
			errorMessage="保存 Shell 输出显示偏好失败。"
			defaultValue="auto"
			options={agentDisplayOptions}
			getMode={(settings) => settings.shell_tool_display_mode}
			updateSettings={(value) => ({
				shell_tool_display_mode: value,
			})}
		/>
	);
};

export const CodeDiffDisplaySettings: FC = () => {
	return (
		<DisplayModeSettings
			title="代码差异显示"
			description="控制代码编辑差异的显示方式。“自动”对单文件写入折叠，对多文件编辑自动展开并显示高度受限的预览。“始终展开”默认展开差异；“始终折叠”保持折叠。"
			ariaLabel="代码差异显示模式"
			errorMessage="保存代码差异显示偏好失败。"
			defaultValue="auto"
			options={agentDisplayOptions}
			getMode={(settings) => settings.code_diff_display_mode}
			updateSettings={(value) => ({
				code_diff_display_mode: value,
			})}
		/>
	);
};
