import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import { Switch } from "#/components/Switch/Switch";
import { cn } from "#/utils/cn";
import { countInvisibleCharacters } from "#/utils/invisibleUnicode";
import {
	TemporarySavedState,
	useTemporarySavedState,
} from "./TemporarySavedState";
import { TextPreviewDialog } from "./TextPreviewDialog";

interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface SystemInstructionsSettingsProps {
	systemPromptData: TypesGen.ChatSystemPromptResponse | undefined;
	onSaveSystemPrompt: (
		req: TypesGen.UpdateChatSystemPromptRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingSystemPrompt: boolean;
	isSaveSystemPromptError: boolean;
	isAnyPromptSaving: boolean;
}

export const SystemInstructionsSettings: FC<
	SystemInstructionsSettingsProps
> = ({
	systemPromptData,
	onSaveSystemPrompt,
	isSavingSystemPrompt,
	isSaveSystemPromptError,
	isAnyPromptSaving,
}) => {
	const [showDefaultPromptPreview, setShowDefaultPromptPreview] =
		useState(false);
	const [isSystemPromptOverflowing, setIsSystemPromptOverflowing] =
		useState(false);
	const { isSavedVisible, showSavedState } = useTemporarySavedState();

	const hasLoadedSystemPrompt = systemPromptData !== undefined;
	const defaultSystemPrompt = systemPromptData?.default_system_prompt ?? "";

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			system_prompt: systemPromptData?.system_prompt ?? "",
			include_default_system_prompt:
				systemPromptData?.include_default_system_prompt ?? false,
		},
		onSubmit: (values, { resetForm }) => {
			onSaveSystemPrompt(values, {
				onSuccess: () => {
					showSavedState();
					resetForm();
				},
			});
		},
	});

	const systemInvisibleCharCount = countInvisibleCharacters(
		form.values.system_prompt,
	);
	const isSystemPromptDisabled = isAnyPromptSaving || !hasLoadedSystemPrompt;

	return (
		<>
			<form className="flex flex-col gap-2" onSubmit={form.handleSubmit}>
				<div className="flex items-center gap-2">
					<h3 className="m-0 text-sm font-semibold text-content-primary">
						系统指令
					</h3>
				</div>
				<div className="flex items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-2 text-xs font-medium text-content-primary">
						<span>包含 Coder Agents 默认系统提示</span>
						<Button
							size="xs"
							variant="subtle"
							type="button"
							onClick={() => setShowDefaultPromptPreview(true)}
							disabled={!hasLoadedSystemPrompt}
							className="min-w-0 px-0 text-content-link hover:text-content-link"
						>
							预览
						</Button>
					</div>
					<Switch
						checked={form.values.include_default_system_prompt}
						onCheckedChange={(checked) =>
							form.setFieldValue("include_default_system_prompt", checked)
						}
						aria-label="包含 Coder Agents 默认系统提示"
						disabled={isSystemPromptDisabled}
					/>
				</div>
				<p className="!mt-0.5 m-0 text-xs text-content-secondary">
					{form.values.include_default_system_prompt
						? "内置的 Coder Agents 提示将前置。下面的附加说明将追加。"
						: "仅使用下面的附加说明。如果为空，则不会发送部署范围的系统提示。"}
				</p>
				<TextareaAutosize
					className={cn(
						"max-h-[240px] w-full resize-none rounded-lg border border-border bg-surface-primary px-4 py-3 font-sans text-sm leading-relaxed text-content-primary placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-content-link/30",
						isSystemPromptOverflowing &&
							"overflow-y-auto [scrollbar-width:thin]",
					)}
					placeholder="所有用户的附加说明"
					name="system_prompt"
					value={form.values.system_prompt}
					onChange={form.handleChange}
					onHeightChange={(height) =>
						setIsSystemPromptOverflowing(height >= 240)
					}
					disabled={isSystemPromptDisabled}
					minRows={1}
				/>
				{systemInvisibleCharCount > 0 && (
					<Alert severity="warning">
						<AlertDescription>
							此文本包含 {systemInvisibleCharCount} 个不可见 Unicode{" "}
							{systemInvisibleCharCount !== 1 ? "字符" : "字符"}，可能会隐藏内容。保存时将会去除。
						</AlertDescription>
					</Alert>
				)}
				<div className="mt-2 flex min-h-6 justify-end gap-2">
					{(form.dirty || isSavedVisible || isSavingSystemPrompt) &&
						(isSavedVisible ? (
							<TemporarySavedState />
						) : (
							<>
								<Button
									size="xs"
									variant="outline"
									type="button"
									onClick={() => form.setFieldValue("system_prompt", "")}
									disabled={
										isSystemPromptDisabled || !form.values.system_prompt
									}
								>
									清除
								</Button>
								<Button
									size="xs"
									type="submit"
									disabled={
										isSystemPromptDisabled ||
										!(form.dirty && hasLoadedSystemPrompt)
									}
								>
									{isSavingSystemPrompt && (
										<Spinner loading className="h-4 w-4" />
									)}
									保存
								</Button>
							</>
						))}
				</div>
				{isSaveSystemPromptError && (
					<p className="m-0 text-xs text-content-destructive">
						保存系统提示失败。
					</p>
				)}
			</form>

			{showDefaultPromptPreview && (
				<TextPreviewDialog
					content={defaultSystemPrompt}
					fileName="默认系统提示"
					onClose={() => setShowDefaultPromptPreview(false)}
				/>
			)}
		</>
	);
};
