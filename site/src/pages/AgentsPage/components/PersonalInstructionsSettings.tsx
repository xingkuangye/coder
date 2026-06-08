import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";
import { cn } from "#/utils/cn";
import { countInvisibleCharacters } from "#/utils/invisibleUnicode";
import {
	TemporarySavedState,
	useTemporarySavedState,
} from "./TemporarySavedState";

interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface PersonalInstructionsSettingsProps {
	userPromptData: TypesGen.UserChatCustomPrompt | undefined;
	onSaveUserPrompt: (
		req: TypesGen.UserChatCustomPrompt,
		options?: MutationCallbacks,
	) => void;
	isSavingUserPrompt: boolean;
	isSaveUserPromptError: boolean;
	isAnyPromptSaving: boolean;
}

export const PersonalInstructionsSettings: FC<
	PersonalInstructionsSettingsProps
> = ({
	userPromptData,
	onSaveUserPrompt,
	isSavingUserPrompt,
	isSaveUserPromptError,
	isAnyPromptSaving,
}) => {
	const [isUserPromptOverflowing, setIsUserPromptOverflowing] = useState(false);
	const { isSavedVisible, showSavedState } = useTemporarySavedState();

	const form = useFormik({
		initialValues: {
			custom_prompt: userPromptData?.custom_prompt ?? "",
		},
		enableReinitialize: true,
		onSubmit: (values, helpers) => {
			onSaveUserPrompt(
				{ custom_prompt: values.custom_prompt },
				{
					onSuccess: () => {
						showSavedState();
						helpers.resetForm();
					},
				},
			);
		},
	});

	const userInvisibleCharCount = countInvisibleCharacters(
		form.values.custom_prompt,
	);

	return (
		<form className="flex flex-col gap-2" onSubmit={form.handleSubmit}>
			<h3 className="m-0 text-sm font-semibold text-content-primary">
				个人指令
			</h3>
			<p className="m-0 text-xs text-content-secondary">
				适用于您的所有对话。仅您可见。
			</p>
			<TextareaAutosize
				className={cn(
					"max-h-[240px] w-full resize-none rounded-lg border border-border bg-surface-primary px-4 py-3 font-sans text-sm leading-relaxed text-content-primary placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-content-link",
					isUserPromptOverflowing && "overflow-y-auto [scrollbar-width:thin]",
				)}
				name="custom_prompt"
				placeholder="附加行为、风格和语气偏好设置"
				value={form.values.custom_prompt}
				onChange={form.handleChange}
				onHeightChange={(height) => setIsUserPromptOverflowing(height >= 240)}
				disabled={isAnyPromptSaving}
				minRows={1}
			/>
			{userInvisibleCharCount > 0 && (
				<Alert severity="warning">
					<AlertDescription>
						此文本包含 {userInvisibleCharCount} 个不可见的 Unicode{" "}
						{userInvisibleCharCount !== 1 ? "个字符" : "个字符"}
						，这些字符可能会隐藏内容。保存时将被去除。
					</AlertDescription>
				</Alert>
			)}
			<div className="mt-2 flex min-h-6 justify-end gap-2">
				{(form.dirty || isSavedVisible || isSavingUserPrompt) &&
					(isSavedVisible ? (
						<TemporarySavedState />
					) : (
						<>
							<Button
								size="xs"
								variant="outline"
								type="button"
								onClick={() => form.setFieldValue("custom_prompt", "")}
								disabled={isAnyPromptSaving || !form.values.custom_prompt}
							>
								清除
							</Button>
							<Button
								size="xs"
								type="submit"
								disabled={isAnyPromptSaving || !form.dirty}
							>
								{isSavingUserPrompt && <Spinner loading className="h-4 w-4" />}
								保存
							</Button>
						</>
					))}
			</div>
			{isSaveUserPromptError && (
				<p className="m-0 text-xs text-content-destructive">
					无法保存个人指令。
				</p>
			)}
		</form>
	);
};
