import { useFormik } from "formik";
import type { FC, ReactNode } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import type { ModelSelectorOption } from "./ChatElements/ModelSelector";
import { ModelSelector } from "./ChatElements/ModelSelector";
import { ModelOverrideAlerts } from "./ModelOverrideAlerts";

export interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface ModelOverrideData {
	readonly model_config_id: string;
	readonly is_malformed: boolean;
}

interface UpdateModelOverrideRequest {
	readonly model_config_id: string;
}

interface SubagentModelOverrideSettingsProps {
	title: string;
	description?: ReactNode;
	modelOverrideData: ModelOverrideData | undefined;
	enabledModelConfigs: readonly TypesGen.ChatModelConfig[];
	modelConfigsError: unknown;
	isLoading: boolean;
	onSaveModelOverride: (
		req: UpdateModelOverrideRequest,
		options?: MutationCallbacks,
	) => void;
	isSaving: boolean;
	isSaveError: boolean;
	saveErrorMessage: string;
	unsetPlaceholder?: string;
	unavailableModelWarning?: string;
	showHeader?: boolean;
	disabled?: boolean;
}

const toModelSelectorOption = (
	modelConfig: TypesGen.ChatModelConfig,
): ModelSelectorOption => ({
	id: modelConfig.id,
	provider: modelConfig.provider,
	model: modelConfig.model,
	displayName: modelConfig.display_name.trim() || modelConfig.model,
	contextLimit: modelConfig.context_limit,
});

export const SubagentModelOverrideSettings: FC<
	SubagentModelOverrideSettingsProps
> = ({
	title,
	description,
	modelOverrideData,
	enabledModelConfigs,
	modelConfigsError,
	isLoading,
	onSaveModelOverride,
	isSaving,
	isSaveError,
	saveErrorMessage,
	unsetPlaceholder = "使用聊天默认值",
	unavailableModelWarning = "已保存的模型不再启用，将被忽略，直到您选择新的覆盖。",
	showHeader = true,
	disabled = false,
}) => {
	const hasLoadedModelOverride = modelOverrideData !== undefined;
	const isMalformedOverride = modelOverrideData?.is_malformed ?? false;
	const enabledModelOptions = enabledModelConfigs.map(toModelSelectorOption);

	const form = useFormik({
		enableReinitialize: true,
		initialValues: {
			model_config_id: modelOverrideData?.model_config_id ?? "",
		},
		onSubmit: (values, { resetForm }) => {
			onSaveModelOverride(
				{
					model_config_id: values.model_config_id,
				},
				{
					onSuccess: () => {
						resetForm({ values });
					},
				},
			);
		},
	});
	const isFormDisabled =
		disabled || isSaving || isLoading || !hasLoadedModelOverride;
	const canSave =
		hasLoadedModelOverride && !disabled && (form.dirty || isMalformedOverride);

	const isUnavailableSavedModel =
		form.values.model_config_id !== "" &&
		!enabledModelOptions.some(
			(option) => option.id === form.values.model_config_id,
		);

	return (
		<form aria-label={title} className="space-y-2" onSubmit={form.handleSubmit}>
			{showHeader && (
				<>
					<h3 className="m-0 text-[13px] font-semibold text-content-primary">
						{title}
					</h3>
					{description && (
						<p className="!mt-0.5 m-0 text-xs text-content-secondary">
							{description}
						</p>
					)}
				</>
			)}
			<ModelSelector
				options={enabledModelOptions}
				value={form.values.model_config_id}
				onValueChange={(value) => form.setFieldValue("model_config_id", value)}
				disabled={isFormDisabled}
				placeholder={
					isUnavailableSavedModel ? "不可用模型" : unsetPlaceholder
				}
				emptyMessage={
					isLoading ? "加载模型中..." : "未找到已启用的模型。"
				}
				className="h-10 w-full justify-between rounded-md border border-border border-solid bg-transparent px-3 text-sm shadow-sm"
				contentClassName="min-w-[18rem]"
			/>
			<ModelOverrideAlerts
				isUnavailableSavedModel={isUnavailableSavedModel}
				unavailableMessage={unavailableModelWarning}
				isMalformedOverride={isMalformedOverride}
				malformedMessage="已保存的覆盖格式错误，将被视为未设置。点击保存可清除它。"
				modelConfigsError={modelConfigsError}
			/>
			<div className="flex justify-end gap-2">
				<Button
					size="sm"
					variant="outline"
					type="button"
					onClick={() => {
						form.setFieldValue("model_config_id", "");
					}}
					disabled={isFormDisabled}
				>
					清除
				</Button>
				<Button size="sm" type="submit" disabled={isFormDisabled || !canSave}>
					保存
				</Button>
			</div>
			{isSaveError && (
				<p className="m-0 text-xs text-content-destructive">
					{saveErrorMessage}
				</p>
			)}
		</form>
	);
};
