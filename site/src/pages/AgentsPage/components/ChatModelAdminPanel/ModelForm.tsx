import { useFormik } from "formik";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	InfoIcon,
	PencilIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import * as Yup from "yup";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "#/components/InputGroup/InputGroup";
import { Label } from "#/components/Label/Label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import { Spinner } from "#/components/Spinner/Spinner";
import { Switch } from "#/components/Switch/Switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { cn } from "#/utils/cn";
import { getFormHelpers } from "#/utils/formUtils";
import { BackButton } from "../BackButton";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import type { ProviderState } from "./ChatModelAdminPanel";
import { readOptionalString } from "./helpers";
import {
	GeneralModelConfigFields,
	ModelConfigFields,
	PricingModelConfigFields,
} from "./ModelConfigFields";
import { ModelIdentifierField } from "./ModelIdentifierField";
import {
	buildInitialModelFormValues,
	buildModelConfigFromForm,
	type ModelFormValues,
	parsePositiveInteger,
	parseThresholdInteger,
} from "./modelConfigFormLogic";
import { ProviderIcon } from "./ProviderIcon";

// ── Validation ──────────────────────────────────────────────────

const validationSchema = Yup.object({
	model: Yup.string().trim().required("模型 ID 是必填项。"),
	displayName: Yup.string(),
	enabled: Yup.boolean(),
	contextLimit: Yup.string()
		.required("上下文限制是必填项。")
		.test(
			"positive-integer",
			"上下文限制必须为正整数。",
			(value) => !value?.trim() || parsePositiveInteger(value) !== null,
		),
	compressionThreshold: Yup.string().test(
		"threshold-range",
		"压缩阈值必须是 0 到 100 之间的数字。",
		(value) => !value?.trim() || parseThresholdInteger(value) !== null,
	),
	isDefault: Yup.boolean(),
});

// ── Component ──────────────────────────────────────────────────

interface ModelFormProps {
	/** When set, the form is in "edit" mode for the given model. */
	editingModel?: TypesGen.ChatModelConfig;
	/** When set without editingModel, the form creates from this model. */
	duplicateSourceModel?: TypesGen.ChatModelConfig;
	providerStates: readonly ProviderState[];
	selectedProvider: string | null;
	selectedProviderState: ProviderState | null;
	onSelectedProviderChange: (provider: string) => void;
	modelConfigsUnavailable: boolean;
	isSaving: boolean;
	isDeleting: boolean;
	onCreateModel: (
		req: TypesGen.CreateChatModelConfigRequest,
	) => Promise<unknown>;
	onUpdateModel: (
		modelConfigId: string,
		req: TypesGen.UpdateChatModelConfigRequest,
	) => Promise<unknown>;
	onCancel: () => void;
	onDeleteModel?: (modelConfigId: string) => Promise<void>;
}

export const ModelForm: FC<ModelFormProps> = ({
	editingModel,
	duplicateSourceModel,
	providerStates,
	selectedProvider,
	selectedProviderState,
	onSelectedProviderChange,
	modelConfigsUnavailable,
	isSaving,
	isDeleting,
	onCreateModel,
	onUpdateModel,
	onCancel,
	onDeleteModel,
}) => {
	const initialModel = editingModel ?? duplicateSourceModel;
	const isEditing = Boolean(editingModel);
	const isDuplicating = Boolean(duplicateSourceModel) && !isEditing;
	const initialValues = {
		...buildInitialModelFormValues(initialModel),
		...(isDuplicating && { isDefault: false }),
	};
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [showPricing, setShowPricing] = useState(false);
	const [showProviderConfig, setShowProviderConfig] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	const canManageModels = Boolean(
		selectedProviderState?.providerConfig &&
			(selectedProviderState.hasEffectiveAPIKey ||
				selectedProviderState.providerConfig.allow_user_api_key),
	);
	const formTitle = isEditing
		? "编辑模型"
		: isDuplicating
			? "复制模型"
			: "添加模型";
	const formDescription = isDuplicating
		? "检查复制后的设置，然后保存以创建新模型。"
		: undefined;
	const mode: "add" | "edit" | "duplicate" = (() => {
		if (isEditing) return "edit";
		if (isDuplicating) return "duplicate";
		return "add";
	})();

	const selectedProviderType =
		selectedProviderState?.provider ?? selectedProvider;

	const form = useFormik<ModelFormValues>({
		initialValues,
		validationSchema,
		validateOnMount: true,
		validateOnBlur: false,
		onSubmit: async (values) => {
			if (isSaving) return;

			const trimmedModel = values.model.trim();
			if (!trimmedModel) return;

			const parsedContextLimit = parsePositiveInteger(values.contextLimit);
			const parsedCompressionThreshold = parseThresholdInteger(
				values.compressionThreshold,
			);

			const buildResult = buildModelConfigFromForm(
				selectedProviderType,
				values.config,
			);
			if (Object.keys(buildResult.fieldErrors).length > 0) return;

			const trimmedDisplayName = values.displayName.trim();
			const builtModelConfig = buildResult.modelConfig;

			const selectedProviderConfigID =
				selectedProviderState?.providerConfig?.id;

			if (isEditing && editingModel) {
				const req: TypesGen.UpdateChatModelConfigRequest = {
					...(selectedProviderConfigID &&
						selectedProviderConfigID !==
							readOptionalString(editingModel.ai_provider_id) && {
							provider: selectedProviderState.provider,
							ai_provider_id: selectedProviderConfigID,
						}),
					...(trimmedModel !== editingModel.model && {
						model: trimmedModel,
					}),
					...(trimmedDisplayName !== (editingModel.display_name ?? "") && {
						display_name: trimmedDisplayName,
					}),
					...(values.enabled !== editingModel.enabled && {
						enabled: values.enabled,
					}),
					...(parsedContextLimit !== null &&
						parsedContextLimit !== editingModel.context_limit && {
							context_limit: parsedContextLimit,
						}),
					...(parsedCompressionThreshold !== null &&
						parsedCompressionThreshold !==
							editingModel.compression_threshold && {
							compression_threshold: parsedCompressionThreshold,
						}),
					...(values.isDefault !== editingModel.is_default && {
						is_default: values.isDefault,
					}),
					// Always send model_config so it can be cleared or updated.
					model_config: builtModelConfig,
				};

				await onUpdateModel(editingModel.id, req);
			} else {
				if (!selectedProvider || !selectedProviderState?.providerConfig) return;

				const req: TypesGen.CreateChatModelConfigRequest = {
					provider: selectedProviderState.provider,
					ai_provider_id: selectedProviderState.providerConfig.id,
					model: trimmedModel,
					enabled: values.enabled,
					is_default: values.isDefault,
					...(parsedContextLimit !== null && {
						context_limit: parsedContextLimit,
					}),
					...(parsedCompressionThreshold !== null && {
						compression_threshold: parsedCompressionThreshold,
					}),
					...(trimmedDisplayName && {
						display_name: trimmedDisplayName,
					}),
					...(builtModelConfig && {
						model_config: builtModelConfig,
					}),
				};

				await onCreateModel(req);
			}
			// Navigation is handled by the parent (ModelsSection) after
			// the mutation promise resolves, so we do not call onCancel()
			// here to avoid a double view-transition.
		},
	});

	const getFieldHelpers = getFormHelpers(form);

	const modelConfigFormBuildResult = buildModelConfigFromForm(
		selectedProviderType,
		form.values.config,
	);

	const hasFieldErrors =
		Object.keys(modelConfigFormBuildResult.fieldErrors).length > 0;
	const defaultModelDisableGuard =
		isEditing && form.values.isDefault && form.values.enabled;

	// ── Provider select (shared across all form states) ───────

	const providerSelect = (
		<div className="grid gap-1.5">
			<Label
				htmlFor="providerSelect"
				className="text-[13px] font-medium text-content-primary"
			>
				提供商
			</Label>
			<Select
				value={selectedProvider ?? ""}
				onValueChange={onSelectedProviderChange}
				disabled={
					((isEditing || isDuplicating) && selectedProviderState !== null) ||
					providerStates.length === 0
				}
			>
				<SelectTrigger
					id="providerSelect"
					className="h-10 max-w-[240px] text-[13px]"
				>
					<SelectValue placeholder="选择提供商" />
				</SelectTrigger>
				<SelectContent>
					{providerStates.map((ps) => (
						<SelectItem key={ps.key} value={ps.key}>
							<span className="flex items-center gap-2">
								<ProviderIcon provider={ps.provider} className="size-4" />
								{ps.label}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);

	// No provider selected or configs unavailable.
	if (!selectedProviderState || modelConfigsUnavailable) {
		return (
			<div>
				<BackButton onClick={onCancel} />
				<h2 className="m-0 text-lg font-medium text-content-primary">
					{formTitle}
				</h2>
				<hr className="my-4 border-0 border-t border-solid border-border" />
				<div className="space-y-3">{providerSelect}</div>
			</div>
		);
	}

	// Provider can't manage models.
	if (!canManageModels && !isEditing) {
		return (
			<div>
				<BackButton onClick={onCancel} />
				<h2 className="m-0 text-lg font-medium text-content-primary">
					{formTitle}
				</h2>
				<hr className="my-4 border-0 border-t border-solid border-border" />
				<div className="space-y-3">
					{providerSelect}
					<p className="text-sm text-content-secondary">
						{!selectedProviderState.providerConfig
							? "在管理模型之前，请在“提供商”选项卡上创建一个托管的提供商配置。"
							: "在管理模型之前，请在“提供商”选项卡上为此提供商设置 API 密钥。"}
					</p>
				</div>
			</div>
		);
	}

	// ── Full form ─────────────────────────────────────────────

	const modelField = getFieldHelpers("model");
	const contextLimitField = getFieldHelpers("contextLimit");
	const compressionThresholdField = getFieldHelpers("compressionThreshold");

	return (
		<div className="flex min-h-full flex-col">
			{/* Back */}
			<BackButton onClick={onCancel} />
			<div className="mb-4">
				<h2 className="m-0 text-lg font-medium text-content-primary">
					{formTitle}
				</h2>
				{formDescription && (
					<p className="m-0 mt-1 text-sm text-content-secondary">
						{formDescription}
					</p>
				)}
			</div>
			{/* Header - editable display name */}
			<div className="flex items-center gap-3">
				{selectedProviderState && (
					<ProviderIcon
						provider={selectedProviderState.provider}
						className="size-8"
					/>
				)}
				<div className="inline-flex items-center gap-1">
					<div className="relative inline-grid">
						<span
							className="invisible col-start-1 row-start-1 whitespace-pre text-lg font-medium"
							aria-hidden="true"
						>
							{form.values.displayName || initialModel?.model || "模型名称"}
						</span>
						<input
							type="text"
							{...form.getFieldProps("displayName")}
							disabled={isSaving}
							spellCheck={false}
							className="col-start-1 row-start-1 m-0 min-w-0 border-0 bg-transparent p-0 text-lg font-medium text-content-primary outline-none placeholder:text-content-secondary focus:ring-0"
							placeholder={initialModel?.model ?? "模型名称"}
						/>
					</div>
					<PencilIcon className="size-3.5 shrink-0 text-content-secondary" />
				</div>{" "}
				{initialModel && (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="ml-auto inline-flex">
								<Switch
									checked={form.values.enabled}
									onCheckedChange={(v) => {
										form.setFieldValue("enabled", v);
									}}
									aria-label="启用"
									disabled={isSaving || defaultModelDisableGuard}
								/>
							</span>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							{defaultModelDisableGuard
								? "默认模型无法禁用。请先取消默认状态。"
								: form.values.enabled
									? "禁用此模型。用户将看不到它。"
									: "启用此模型。用户将可以看到它。"}
						</TooltipContent>
					</Tooltip>
				)}
			</div>
			<hr className="my-4 border-0 border-t border-solid border-border" />
			{/* Form body */}
			<form
				className="flex flex-1 flex-col"
				onSubmit={form.handleSubmit}
				spellCheck={false}
				autoComplete="off"
			>
				<div className="space-y-6">
					{/* Model ID + Context limit + Pricing */}
					<div className="space-y-4">
						<div className="grid items-start gap-4 sm:grid-cols-2">
							{" "}
							<ModelIdentifierField
								form={form}
								modelField={modelField}
								mode={mode}
								selectedProvider={selectedProviderType}
								disabled={isSaving}
							/>
							<div className="grid gap-1.5">
								<Label
									htmlFor={contextLimitField.id}
									className="inline-flex items-center gap-1 text-sm font-medium text-content-primary"
								>
									上下文限制{" "}
									<span className="text-xs font-bold text-content-destructive">
										*
									</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<InfoIcon className="size-3 text-content-secondary" />
										</TooltipTrigger>
										<TooltipContent side="top" className="max-w-[240px]">
											上下文窗口中的最大令牌数。
										</TooltipContent>
									</Tooltip>
								</Label>
								<InputGroup
									className={cn(
										"h-9",
										contextLimitField.error && "border-border-destructive",
									)}
								>
									<InputGroupInput
										id={contextLimitField.id}
										name={contextLimitField.name}
										className="h-9 min-w-0 text-[13px] placeholder:text-content-disabled"
										placeholder="200000"
										value={contextLimitField.value}
										onChange={contextLimitField.onChange}
										onBlur={contextLimitField.onBlur}
										disabled={isSaving}
										aria-invalid={contextLimitField.error}
									/>
									<InputGroupAddon align="inline-end">
										<span className="text-xs text-content-disabled">
											令牌
										</span>
									</InputGroupAddon>
								</InputGroup>{" "}
								{contextLimitField.error && (
									<p className="m-0 text-xs text-content-destructive">
										{contextLimitField.helperText}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Cost tracking */}
					<div className="border-0 border-t border-solid border-border pt-4">
						<button
							type="button"
							onClick={() => setShowPricing((v) => !v)}
							className="flex w-full cursor-pointer items-start justify-between border-0 bg-transparent p-0 text-left transition-colors hover:text-content-primary"
						>
							<div>
								<h3 className="m-0 text-sm font-medium text-content-primary">
									成本追踪
								</h3>
								<p className="m-0 text-xs text-content-secondary">
									设置每个令牌的定价，以便 Coder 追踪成本并强制执行消费限制。
								</p>
							</div>
							{showPricing ? (
								<ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							) : (
								<ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							)}
						</button>
						{showPricing && (
							<div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4">
								<PricingModelConfigFields
									provider={selectedProviderState.provider}
									form={form}
									fieldErrors={modelConfigFormBuildResult.fieldErrors}
									disabled={isSaving}
								/>
							</div>
						)}
					</div>

					{/* Provider configuration */}
					<div className="border-0 border-t border-solid border-border pt-4">
						<button
							type="button"
							onClick={() => setShowProviderConfig((v) => !v)}
							className="flex w-full cursor-pointer items-start justify-between border-0 bg-transparent p-0 text-left transition-colors hover:text-content-primary"
						>
							<div>
								<h3 className="m-0 text-sm font-medium text-content-primary">
									提供商配置
								</h3>
								<p className="m-0 text-xs text-content-secondary">
									调整提供商特定的行为，例如推理、工具调用和网络搜索。
								</p>
							</div>
							{showProviderConfig ? (
								<ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							) : (
								<ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							)}
						</button>
						{showProviderConfig && (
							<div className="pt-3">
								<ModelConfigFields
									provider={selectedProviderState.provider}
									form={form}
									fieldErrors={modelConfigFormBuildResult.fieldErrors}
									disabled={isSaving}
								/>
							</div>
						)}
					</div>

					{/* Advanced */}
					<div className="border-0 border-t border-solid border-border pt-4">
						<button
							type="button"
							onClick={() => setShowAdvanced((v) => !v)}
							className="flex w-full cursor-pointer items-start justify-between border-0 bg-transparent p-0 text-left transition-colors hover:text-content-primary"
						>
							<div>
								<h3 className="m-0 text-sm font-medium text-content-primary">
									高级设置
								</h3>
								<p className="m-0 text-xs text-content-secondary">
									低级参数，如温度和惩罚。很少需要更改。
								</p>
							</div>
							{showAdvanced ? (
								<ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							) : (
								<ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-content-secondary" />
							)}
						</button>
						{showAdvanced && (
							<div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
								<GeneralModelConfigFields
									provider={selectedProviderState.provider}
									form={form}
									fieldErrors={modelConfigFormBuildResult.fieldErrors}
									disabled={isSaving}
								/>
								<div className="flex min-w-0 flex-col gap-1.5">
									<Label
										htmlFor={compressionThresholdField.id}
										className="inline-flex items-center gap-1 text-[13px] font-medium text-content-primary"
									>
										压缩阈值
										<Tooltip>
											<TooltipTrigger asChild>
												<InfoIcon className="size-3 text-content-secondary" />
											</TooltipTrigger>
											<TooltipContent side="top" className="max-w-[240px]">
												上下文被压缩的百分比。
											</TooltipContent>
										</Tooltip>
									</Label>
									<InputGroup
										className={cn(
											"h-9",
											compressionThresholdField.error &&
												"border-border-destructive",
										)}
									>
										<InputGroupInput
											id={compressionThresholdField.id}
											name={compressionThresholdField.name}
											className="h-9 text-[13px] placeholder:text-content-disabled"
											placeholder="70"
											value={compressionThresholdField.value}
											onChange={compressionThresholdField.onChange}
											onBlur={compressionThresholdField.onBlur}
											disabled={isSaving}
											aria-invalid={compressionThresholdField.error}
										/>
										<InputGroupAddon align="inline-end">
											<span className="text-xs text-content-disabled">%</span>
										</InputGroupAddon>
									</InputGroup>
									{compressionThresholdField.error && (
										<p className="m-0 text-xs text-content-destructive">
											{compressionThresholdField.helperText}
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="mt-auto py-6">
					<hr className="mb-4 border-0 border-t border-solid border-border" />
					<div className="flex items-center justify-between">
						{isEditing && editingModel && onDeleteModel ? (
							<Button
								variant="outline"
								size="lg"
								type="button"
								className="text-content-secondary hover:text-content-destructive hover:border-border-destructive"
								disabled={isSaving}
								onClick={() => setConfirmingDelete(true)}
							>
								删除
							</Button>
						) : (
							<Button
								variant="outline"
								size="lg"
								type="button"
								onClick={onCancel}
							>
								取消
							</Button>
						)}
						<Button
							size="lg"
							type="submit"
							disabled={isSaving || !form.isValid || hasFieldErrors}
						>
							{isSaving && <Spinner className="h-4 w-4" loading />}{" "}
							{isEditing
								? "保存"
								: isDuplicating
									? "创建副本"
									: "添加模型"}
						</Button>
					</div>
				</div>
			</form>
			{editingModel && onDeleteModel && (
				<ConfirmDeleteDialog
					entity="模型"
					onConfirm={() => void onDeleteModel(editingModel.id)}
					isPending={isDeleting}
					open={confirmingDelete}
					onOpenChange={(open) => !open && setConfirmingDelete(false)}
				/>
			)}{" "}
		</div>
	);
};
