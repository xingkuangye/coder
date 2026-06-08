import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { cn } from "#/utils/cn";
import { countInvisibleCharacters } from "#/utils/invisibleUnicode";

interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface PlanModeInstructionsSettingsProps {
	planModeInstructionsData:
		| TypesGen.ChatPlanModeInstructionsResponse
		| undefined;
	onSavePlanModeInstructions: (
		req: TypesGen.UpdateChatPlanModeInstructionsRequest,
		options?: MutationCallbacks,
	) => void;
	isSavePlanModeInstructionsError: boolean;
	isAnyPromptSaving: boolean;
}

export const PlanModeInstructionsSettings: FC<
	PlanModeInstructionsSettingsProps
> = ({
	planModeInstructionsData,
	onSavePlanModeInstructions,
	isSavePlanModeInstructionsError,
	isAnyPromptSaving,
}) => {
	const [
		isPlanModeInstructionsOverflowing,
		setIsPlanModeInstructionsOverflowing,
	] = useState(false);

	const hasLoadedPlanModeInstructions = planModeInstructionsData !== undefined;

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			plan_mode_instructions:
				planModeInstructionsData?.plan_mode_instructions ?? "",
		},
		onSubmit: (values, { resetForm }) => {
			onSavePlanModeInstructions(values, {
				onSuccess: () => {
					resetForm();
				},
			});
		},
	});

	const planModeInvisibleCharCount = countInvisibleCharacters(
		form.values.plan_mode_instructions,
	);
	const isPlanModeInstructionsDisabled =
		isAnyPromptSaving || !hasLoadedPlanModeInstructions;

	return (
		<form className="space-y-2" onSubmit={form.handleSubmit}>
			<div className="flex items-center gap-2">
				<h3 className="m-0 text-[13px] font-semibold text-content-primary">
					规划模式指令
				</h3>
			</div>
			<p className="!mt-0.5 m-0 text-xs text-content-secondary">
				当代理进入规划模式时应用的自定义指令。这些指令补充内置的规划行为。
			</p>
			<TextareaAutosize
				className={cn(
					"max-h-[240px] w-full resize-none rounded-lg border border-border bg-surface-primary px-4 py-3 font-sans text-[13px] leading-relaxed text-content-primary placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-content-link/30",
					isPlanModeInstructionsOverflowing &&
						"overflow-y-auto [scrollbar-width:thin]",
				)}
				placeholder="规划模式的额外指令"
				name="plan_mode_instructions"
				value={form.values.plan_mode_instructions}
				onChange={form.handleChange}
				onHeightChange={(height) =>
					setIsPlanModeInstructionsOverflowing(height >= 240)
				}
				disabled={isPlanModeInstructionsDisabled}
				minRows={4}
				maxRows={12}
			/>
			{planModeInvisibleCharCount > 0 && (
				<Alert severity="warning">
					<AlertDescription>
						此文本包含 {planModeInvisibleCharCount} 个不可见的 Unicode{" "}
						{planModeInvisibleCharCount !== 1 ? "字符" : "字符"}，可能隐藏内容。这些将在保存时被移除。
					</AlertDescription>
				</Alert>
			)}
			<div className="flex justify-end gap-2">
				<Button
					size="sm"
					variant="outline"
					type="button"
					onClick={() => form.setFieldValue("plan_mode_instructions", "")}
					disabled={
						isPlanModeInstructionsDisabled ||
						!form.values.plan_mode_instructions
					}
				>
					清除
				</Button>
				<Button
					size="sm"
					type="submit"
					disabled={
						isPlanModeInstructionsDisabled ||
						!(form.dirty && hasLoadedPlanModeInstructions)
					}
				>
					保存
				</Button>
			</div>
			{isSavePlanModeInstructionsError && (
				<p className="m-0 text-xs text-content-destructive">
					保存规划模式指令失败。
				</p>
			)}
		</form>
	);
};
