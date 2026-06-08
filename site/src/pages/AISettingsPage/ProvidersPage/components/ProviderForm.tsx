import { useFormik } from "formik";
import { TriangleAlertIcon } from "lucide-react";
import { type FC, useEffect, useRef } from "react";
import { Link } from "react-router";
import * as Yup from "yup";
import type { AIProviderType } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { Form, FormFields } from "#/components/Form/Form";
import { FormField } from "#/components/FormField/FormField";
import { Spinner } from "#/components/Spinner/Spinner";
import { useUnsavedChangesPrompt } from "#/hooks/useUnsavedChangesPrompt";
import { getFormHelpers } from "#/utils/formUtils";
import { CredentialField } from "./CredentialField";

export type ProviderFormValues = {
	type: AIProviderType | "";
	name: string;
	displayName: string;
	baseUrl: string;
	model: string;
	smallFastModel: string;
	accessKey: string;
	accessKeySecret: string;
	apiKey: string;
	enabled: boolean;
};

const HTTP_SCHEME_REGEX = /^https?:\/\//i;
const BEDROCK_CANONICAL_URL_REGEX =
	/^https:\/\/bedrock-runtime\.([a-z0-9-]+)\.amazonaws\.com\/?$/i;
const PROVIDER_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SAVED_CREDENTIAL_MASK = "********";

export const parseBedrockRegionFromBaseUrl = (
	baseUrl: string,
): string | undefined => {
	const match = BEDROCK_CANONICAL_URL_REGEX.exec(baseUrl.trim());
	return match?.[1]?.toLowerCase();
};

const makeNameSchema = (editing: boolean) =>
	editing
		? Yup.string()
		: Yup.string()
				.matches(
					PROVIDER_NAME_REGEX,
					"名称必须为小写，使用连字符分隔（例如 'my-anthropic'）。",
				)
				.required("名称为必填项");

// Display name is always optional. The form copy says blank falls back
// to the provider name, and the update API supports clearing the value.
const makeDisplayNameSchema = (_editing: boolean) => Yup.string();

const defaultInitialValues: ProviderFormValues = {
	type: "anthropic",
	name: "",
	displayName: "",
	baseUrl: "",
	model: "",
	smallFastModel: "",
	accessKey: "",
	accessKeySecret: "",
	apiKey: "",
	enabled: true,
};

const providerDefaults: Partial<
	Record<AIProviderType, Partial<ProviderFormValues>>
> = {
	openai: { name: "openai", baseUrl: "https://api.openai.com/v1/" },
	anthropic: { name: "anthropic", baseUrl: "https://api.anthropic.com" },
	bedrock: {
		name: "bedrock",
		baseUrl: "https://bedrock-runtime.us-east-2.amazonaws.com",
	},
	azure: {
		name: "azure",
		baseUrl: "https://YOUR-RESOURCE.openai.azure.com/openai/v1",
	},
	copilot: {
		name: "copilot",
		baseUrl: "https://api.business.githubcopilot.com",
	},
	google: {
		name: "google",
		baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
	},
	"openai-compat": { name: "openai-compat", baseUrl: "" },
	openrouter: { name: "openrouter", baseUrl: "https://openrouter.ai/api/v1" },
	vercel: { name: "vercel", baseUrl: "https://ai-gateway.vercel.sh/v1" },
};

const makeOpenAiAnthropicSchema = (editing: boolean) =>
	Yup.object({
		type: Yup.string()
			.oneOf([
				"openai",
				"anthropic",
				"azure",
				"google",
				"openai-compat",
				"openrouter",
				"vercel",
			] as const)
			.required(),
		name: makeNameSchema(editing),
		displayName: makeDisplayNameSchema(editing),
		baseUrl: Yup.string()
			.url("端点必须是一个有效的 URL")
			.matches(HTTP_SCHEME_REGEX, "端点必须使用 http 或 https。")
			.required("端点为必填项"),
		apiKey: editing
			? Yup.string()
			: Yup.string().required("API 密钥为必填项"),
		enabled: Yup.boolean(),
	});

const credentialFilled = (value: string | undefined): boolean => {
	if (!value) return false;
	const trimmed = value.trim();
	return trimmed !== "" && trimmed !== SAVED_CREDENTIAL_MASK;
};

const makeBedrockSchema = (editing: boolean) =>
	Yup.object({
		type: Yup.string()
			.oneOf(["bedrock"] as const)
			.required(),
		name: makeNameSchema(editing),
		displayName: makeDisplayNameSchema(editing),
		baseUrl: Yup.string()
			.url("端点必须是一个有效的 URL")
			.matches(
				BEDROCK_CANONICAL_URL_REGEX,
				"端点必须是一个标准的 AWS Bedrock URL。",
			)
			.required("端点为必填项"),
		apiKey: Yup.string(),
		model: Yup.string().required("模型为必填项"),
		smallFastModel: Yup.string().required("轻量快速模型为必填项"),
		accessKey: (editing
			? Yup.string()
			: Yup.string().required("访问密钥为必填项")
		).test(
			"access-key-paired",
			"同时输入访问密钥和访问密钥密文以轮换凭证。",
			function (value) {
				const secret = (this.parent as { accessKeySecret?: string })
					.accessKeySecret;
				return !(credentialFilled(secret) && !credentialFilled(value));
			},
		),
		accessKeySecret: (editing
			? Yup.string()
			: Yup.string().required("访问密钥密文为必填项")
		).test(
			"access-key-secret-paired",
			"同时输入访问密钥和访问密钥密文以轮换凭证。",
			function (value) {
				const accessKey = (this.parent as { accessKey?: string }).accessKey;
				return !(credentialFilled(accessKey) && !credentialFilled(value));
			},
		),
		enabled: Yup.boolean(),
	});

const makeCopilotSchema = (editing: boolean) =>
	Yup.object({
		type: Yup.string()
			.oneOf(["copilot"] as const)
			.required(),
		name: makeNameSchema(editing),
		displayName: makeDisplayNameSchema(editing),
		baseUrl: Yup.string()
			.url("端点必须是一个有效的 URL")
			.matches(HTTP_SCHEME_REGEX, "端点必须使用 http 或 https。")
			.required("端点为必填项"),
		enabled: Yup.boolean(),
	});

const getProviderFormSchema = (editing: boolean) =>
	Yup.lazy((value: { type?: AIProviderType } | undefined) => {
		switch (value?.type) {
			case "openai":
			case "anthropic":
			case "azure":
			case "google":
			case "openai-compat":
			case "openrouter":
			case "vercel":
				return makeOpenAiAnthropicSchema(editing);
			case "bedrock":
				return makeBedrockSchema(editing);
			case "copilot":
				return makeCopilotSchema(editing);
			default:
				return Yup.object({
					type: Yup.string()
						.oneOf([
							"openai",
							"anthropic",
							"bedrock",
							"azure",
							"copilot",
							"google",
							"openai-compat",
							"openrouter",
							"vercel",
						])
						.required(),
				});
		}
	});

type ProviderFormProps = {
	editing?: boolean;
	/** When editing Bedrock and the API already has keys, show masked placeholders until cleared. */
	bedrockSavedAccessCredentials?: boolean;
	/** When editing openai/anthropic and a key is on file, show a masked placeholder until cleared. */
	openAiAnthropicSavedApiKey?: boolean;
	/** Masked rendering of the saved openai/anthropic key (e.g. `sk-***...ABCD`). Falls back to a generic mask when omitted. */
	openAiAnthropicMaskedApiKey?: string;
	initialValues?: Partial<ProviderFormValues>;
	onSubmit?: (values: ProviderFormValues) => void;
	isLoading?: boolean;
	submitError?: unknown;
};

const namePlaceholder = (provider: string) =>
	providerDefaults[provider as keyof typeof providerDefaults]?.name;

const apiKeyPlaceholder = (provider: string) => {
	switch (provider) {
		case "openai":
			return "sk-proj-...";
		case "anthropic":
			return "sk-ant-...";
	}
};

const baseUrlPlaceholder = (provider: string) =>
	providerDefaults[provider as keyof typeof providerDefaults]?.baseUrl;

export const ProviderForm: FC<ProviderFormProps> = ({
	editing = false,
	bedrockSavedAccessCredentials = false,
	openAiAnthropicSavedApiKey = false,
	openAiAnthropicMaskedApiKey,
	initialValues,
	onSubmit,
	isLoading = false,
	submitError,
}) => {
	const resolvedType = initialValues?.type ?? defaultInitialValues.type;
	const typeDefaults =
		providerDefaults[resolvedType as keyof typeof providerDefaults];

	// Seed Bedrock credentials with the mask when on file; focus clears it,
	// and a re-submitted "" tells the API mapping to keep the value.
	const maskedAccessKey = bedrockSavedAccessCredentials
		? SAVED_CREDENTIAL_MASK
		: "";
	const maskedAccessKeySecret = bedrockSavedAccessCredentials
		? SAVED_CREDENTIAL_MASK
		: "";
	// Same pattern for openai/anthropic. Prefer the API-supplied masked
	// rendering so the user sees the key's identifying suffix.
	const maskedApiKey = openAiAnthropicSavedApiKey
		? (openAiAnthropicMaskedApiKey ?? SAVED_CREDENTIAL_MASK)
		: "";

	const didSubmit = useRef(false);
	const form = useFormik<ProviderFormValues>({
		initialValues: {
			...defaultInitialValues,
			// Layer order: base defaults < type prefills < parent's initialValues.
			// Edit overrides prefills with server values; create gets them as-is.
			...(typeDefaults ?? {}),
			...initialValues,
			accessKey: maskedAccessKey,
			accessKeySecret: maskedAccessKeySecret,
			apiKey: maskedApiKey,
		},
		validationSchema: getProviderFormSchema(editing),
		validateOnMount: true,
		onSubmit: (values) => {
			didSubmit.current = true;
			return onSubmit?.(values);
		},
	});
	const getFieldHelpers = getFormHelpers(form, submitError);

	const typeSelectValue = form.values.type;

	// Clears the field once if it's still showing the seeded mask;
	// subsequent focuses are no-ops.
	const handleCredentialFocus = (
		field: "apiKey" | "accessKey" | "accessKeySecret",
	) => {
		const initial = form.initialValues[field];
		if (form.values[field] === initial && initial !== "") {
			void form.setFieldValue(field, "");
		}
	};

	// Restores the mask when the user leaves the field without entering
	// a new value, keeping the saved-credential appearance.
	const handleCredentialBlur = (
		field: "apiKey" | "accessKey" | "accessKeySecret",
	) => {
		const initial = form.initialValues[field];
		if (form.values[field] === "" && initial !== "") {
			void form.setFieldValue(field, initial);
		}
	};

	// When the parent's mutation finishes without an error, treat the just-
	// submitted values as the new baseline so the unsaved-changes prompt does
	// not fire on subsequent navigations. React Query reports a missing error
	// as `null`, so a truthy check covers both null and undefined.
	const previousIsLoading = useRef(isLoading);
	useEffect(() => {
		if (previousIsLoading.current && !isLoading) {
			if (didSubmit.current && !submitError) {
				// Restore credential fields to their initial masked sentinels so
				// the raw key is never left visible after a successful save.
				const remaskedValues = {
					...form.values,
					apiKey: maskedApiKey,
					accessKey: maskedAccessKey,
					accessKeySecret: maskedAccessKeySecret,
				};
				form.resetForm({ values: remaskedValues });
			}
			didSubmit.current = false;
		}
		previousIsLoading.current = isLoading;
	}, [
		isLoading,
		submitError,
		form,
		maskedApiKey,
		maskedAccessKey,
		maskedAccessKeySecret,
	]);

	const unsavedChanges = useUnsavedChangesPrompt(
		form.dirty && !form.isSubmitting,
	);

	return (
		<Form onSubmit={form.handleSubmit}>
			<FormFields>
				{Boolean(submitError) && <ErrorAlert error={submitError} />}
				{typeSelectValue !== "" && typeSelectValue !== "bedrock" && (
					<>
						<div className="grid grid-cols-2 items-start gap-4">
							<FormField
								required
								field={getFieldHelpers("name")}
								label="名称"
								description="唯一标识符（用于 URL 中，不可更改）"
								className="w-full"
								placeholder={namePlaceholder(form.values.type)}
								disabled={editing}
							/>
							<FormField
								field={getFieldHelpers("displayName")}
								label="显示名称"
								description="友好名称。如果留空则默认使用名称。"
								className="w-full"
							/>
						</div>
						<FormField
							required
							field={getFieldHelpers("baseUrl")}
							label="端点"
							description={
								typeSelectValue === "copilot" ? (
									<>
										您的 Copilot 层级的基 URL：
										<code>https://api.individual.githubcopilot.com</code>、
										<code>https://api.business.githubcopilot.com</code> 或
										<code>https://api.enterprise.githubcopilot.com</code>。
									</>
								) : (
									"提供程序 API 所在的基础 URL。"
								)
							}
							className="w-full"
							placeholder={baseUrlPlaceholder(form.values.type)}
						/>
						{typeSelectValue === "copilot" ? (
							<p className="text-sm text-content-secondary m-0">
								Copilot 在请求时使用每个用户的 GitHub OAuth 令牌进行身份验证，因此此处无需配置 API 密钥。这需要配置一个 GitHub 外部身份验证提供程序。
							</p>
						) : (
							<CredentialField
								required
								label="API 密钥"
								helpers={getFieldHelpers("apiKey")}
								onBlur={() => handleCredentialBlur("apiKey")}
								onFocus={() => handleCredentialFocus("apiKey")}
								autoComplete="new-password"
								placeholder={apiKeyPlaceholder(form.values.type)}
							/>
						)}
					</>
				)}

				{typeSelectValue === "bedrock" && (
					<>
						<div className="grid grid-cols-2 items-start gap-4">
							<FormField
								required
								field={getFieldHelpers("name")}
								label="名称"
								description="唯一标识符（用于 URL 中，不可更改）"
								className="w-full"
								placeholder={namePlaceholder(form.values.type)}
								disabled={editing}
							/>
							<FormField
								field={getFieldHelpers("displayName")}
								label="显示名称"
								description="友好名称。如果留空则默认使用名称。"
								className="w-full"
							/>
						</div>
						<FormField
							required
							field={getFieldHelpers("baseUrl")}
							label="端点"
							description={
								<>
									格式为{" "}
									<code>
										{"https://bedrock-runtime.{region}.amazonaws.com"}
									</code>
								</>
							}
							className="w-full"
							placeholder={baseUrlPlaceholder(form.values.type)}
						/>
						<div className="grid grid-cols-2 items-start gap-4">
							<FormField
								required
								field={getFieldHelpers("model")}
								label="模型"
								className="w-full"
								placeholder="anthropic.claude-3-5-sonnet-20241022-v2:0"
							/>
							<FormField
								required
								field={getFieldHelpers("smallFastModel")}
								label="轻量快速模型"
								className="w-full"
								placeholder="anthropic.claude-3-haiku-20240307-v1:0"
							/>
						</div>
						<div className="grid grid-cols-2 items-start gap-4">
							<CredentialField
								required
								label="访问密钥"
								helpers={getFieldHelpers("accessKey")}
								onBlur={() => handleCredentialBlur("accessKey")}
								onFocus={() => handleCredentialFocus("accessKey")}
								autoComplete="new-password"
							/>
							<CredentialField
								required
								label="访问密钥密文"
								helpers={getFieldHelpers("accessKeySecret")}
								onBlur={() => handleCredentialBlur("accessKeySecret")}
								onFocus={() => handleCredentialFocus("accessKeySecret")}
								autoComplete="new-password"
							/>
						</div>
					</>
				)}

				<div className="flex justify-end gap-4">
					<Link to="/ai/settings">
						<Button variant="outline" type="button">
							取消
						</Button>
					</Link>
					<Button
						disabled={isLoading || !form.isValid || (editing && !form.dirty)}
						type="submit"
					>
						<Spinner loading={isLoading} />
						{editing ? "更新提供程序" : "添加提供程序"}
					</Button>
				</div>
			</FormFields>
			<ConfirmDialog
				type="info"
				hideCancel={false}
				open={unsavedChanges.isOpen}
				onClose={unsavedChanges.onCancel}
				onConfirm={unsavedChanges.onConfirm}
				title="未保存的更改"
				confirmText="确认"
				description={
					<div className="flex items-start gap-3">
						<TriangleAlertIcon className="size-icon-sm mt-1 shrink-0" />
						<p className="m-0">
							您的更新尚未保存。是否仍要离开？
						</p>
					</div>
				}
			/>
		</Form>
	);
};
