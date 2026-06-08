import { InfoIcon } from "lucide-react";
import {
	type CSSProperties,
	type FC,
	type FormEvent,
	type ReactNode,
	useId,
	useState,
} from "react";
import { useNavigate } from "react-router";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Input } from "#/components/Input/Input";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { formatProviderLabel } from "../../utils/modelOptions";
import { BackButton } from "../BackButton";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import type {
	CreateProviderResult,
	ProviderState,
} from "./ChatModelAdminPanel";
import { getProviderBaseURLPlaceholder, readOptionalString } from "./helpers";
import { ProviderIcon } from "./ProviderIcon";

// Sentinel value used to represent an existing API key that the
// backend will not reveal. If the user has not touched the field,
// we know nothing changed.
const API_KEY_PLACEHOLDER = "••••••••••••••••";

interface ProviderFormProps {
	providerState: ProviderState;
	providerConfigsUnavailable: boolean;
	isProviderMutationPending: boolean;
	onCreateProvider: (
		req: TypesGen.CreateChatProviderConfigRequest,
	) => Promise<CreateProviderResult>;
	onUpdateProvider: (
		providerConfigId: string,
		req: TypesGen.UpdateChatProviderConfigRequest,
	) => Promise<unknown>;
	onDeleteProvider: (providerConfigId: string) => Promise<void>;
	onBack: () => void;
}

export const ProviderForm: FC<ProviderFormProps> = ({
	providerState,
	providerConfigsUnavailable,
	isProviderMutationPending,
	onCreateProvider,
	onUpdateProvider,
	onDeleteProvider,
	onBack,
}) => {
	const navigate = useNavigate();
	const { provider, providerConfig, baseURL, isEnvPreset } = providerState;

	const apiKeyInputId = useId();
	const baseURLInputId = useId();

	const baseURLPlaceholder = getProviderBaseURLPlaceholder(provider);

	// Initial values are snapshotted when the provider config changes
	// so we can detect dirty state.
	const [initialValues] = useState(() => ({
		displayName: readOptionalString(providerConfig?.display_name) ?? "",
		baseURL,
	}));

	const [displayName, setDisplayName] = useState(initialValues.displayName);
	const [apiKey, setApiKey] = useState(
		providerState.hasManagedAPIKey ? API_KEY_PLACEHOLDER : "",
	);
	const [apiKeyTouched, setApiKeyTouched] = useState(false);
	const [apiKeyModified, setApiKeyModified] = useState(false);
	const [baseURLValue, setBaseURLValue] = useState(initialValues.baseURL);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	const isBedrockProvider = provider === "bedrock";
	const isAPIKeyEnvManaged = isEnvPreset && !providerConfig;
	const requiresAPIKey =
		!providerState.allowUserAPIKey &&
		!isBedrockProvider &&
		!providerState.hasManagedAPIKey;

	const effectiveApiKey =
		apiKeyTouched && apiKey !== API_KEY_PLACEHOLDER ? apiKey : "";
	const hasTypedAPIKey = effectiveApiKey.length > 0;
	const hasAPIKeyWhitespace =
		hasTypedAPIKey && effectiveApiKey.trim() !== effectiveApiKey;
	// Clearing a saved provider-scoped key switches the provider to
	// BYOK-only behavior, or ambient AWS credentials for Bedrock.
	const isClearingAPIKey =
		providerState.hasManagedAPIKey && apiKeyModified && effectiveApiKey === "";
	const hasPendingAPIKeyChange = hasTypedAPIKey || isClearingAPIKey;
	const shouldCreateAPIKey = hasTypedAPIKey;
	const apiKeyDescription = isBedrockProvider
		? "用于 Bedrock 身份验证的 Bearer 令牌。留空则使用环境 AWS 凭据。"
		: "用于向此提供商认证请求的密钥。";
	const baseURLDescription = isBedrockProvider
		? "Bedrock 运行时端点。使用该提供商应调用的模型所在 AWS 区域。"
		: "用于调用此提供商的端点。";
	const apiKeyPlaceholder = isBedrockProvider ? "输入 Bearer 令牌" : "sk-...";
	const deleteProviderDescription =
		"确定要删除此提供商吗？提供商将被禁用并从新模型配置中隐藏。引用它的现有模型配置将保留，但在更新之前无法运行。";
	const hasNewProviderConfiguration = !providerConfig;

	const isDirty =
		displayName.trim() !== initialValues.displayName ||
		hasPendingAPIKeyChange ||
		baseURLValue.trim() !== initialValues.baseURL.trim() ||
		hasNewProviderConfiguration;

	const hasBaseURL = baseURLValue.trim().length > 0;
	const canSave =
		!providerConfigsUnavailable &&
		!isProviderMutationPending &&
		!isAPIKeyEnvManaged &&
		isDirty &&
		hasBaseURL &&
		!hasAPIKeyWhitespace &&
		(!requiresAPIKey || hasTypedAPIKey);
	const canAddModel =
		Boolean(providerConfig) &&
		(providerState.hasEffectiveAPIKey ||
			providerConfig?.allow_user_api_key === true);

	const handleAddModel = () => {
		const params = new URLSearchParams({ newModel: providerState.key });
		navigate(`/agents/settings/models?${params.toString()}`, {
			state: { pushed: true },
		});
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (
			providerConfigsUnavailable ||
			isProviderMutationPending ||
			isAPIKeyEnvManaged ||
			!hasBaseURL ||
			hasAPIKeyWhitespace
		) {
			return;
		}

		if (requiresAPIKey && !hasTypedAPIKey) {
			return;
		}

		const trimmedDisplayName = displayName.trim();
		const trimmedBaseURL = baseURLValue.trim();

		if (providerConfig) {
			const currentDisplayName =
				readOptionalString(providerConfig.display_name) ?? "";
			const currentBaseURL = baseURL.trim();
			const req: TypesGen.UpdateChatProviderConfigRequest = {
				...(trimmedDisplayName !== currentDisplayName && {
					display_name: trimmedDisplayName,
				}),
				...(hasPendingAPIKeyChange && { api_key: effectiveApiKey }),
				...(trimmedBaseURL !== currentBaseURL && {
					base_url: trimmedBaseURL,
				}),
			};

			if (Object.keys(req).length === 0) {
				return;
			}

			try {
				await onUpdateProvider(providerConfig.id, req);
			} catch {
				return;
			}
		} else {
			const req: TypesGen.CreateChatProviderConfigRequest = {
				provider,
				base_url: trimmedBaseURL,
				...(shouldCreateAPIKey && { api_key: effectiveApiKey }),
				...(trimmedDisplayName && {
					display_name: trimmedDisplayName,
				}),
			};

			try {
				await onCreateProvider(req);
			} catch {
				return;
			}
		}

		setApiKeyTouched(false);
		setApiKeyModified(false);
		setApiKey(API_KEY_PLACEHOLDER);
	};

	const handleApiKeyFocus = () => {
		// Clear the placeholder on first focus so the user starts
		// with a blank field and Chrome does not try to autofill.
		if (!apiKeyTouched && apiKey === API_KEY_PLACEHOLDER) {
			setApiKey("");
			setApiKeyTouched(true);
		}
	};

	const isDisabled = providerConfigsUnavailable || isProviderMutationPending;

	return (
		<div className="flex min-h-full flex-col">
			<BackButton onClick={onBack} />
			<div className="flex items-center gap-3">
				<ProviderIcon provider={provider} className="size-8" />
				<div className="min-w-0 flex-1">
					<input
						type="text"
						value={displayName || formatProviderLabel(provider)}
						onChange={(event) => setDisplayName(event.target.value)}
						disabled={isDisabled || isAPIKeyEnvManaged}
						className="m-0 w-full border-0 bg-transparent p-0 text-lg font-medium text-content-primary outline-none placeholder:text-content-secondary focus:ring-0"
						placeholder={formatProviderLabel(provider)}
					/>
				</div>
				<Tooltip>
					<TooltipTrigger asChild>
						<InfoIcon className="size-4 shrink-0 cursor-help text-content-secondary" />
					</TooltipTrigger>
					<TooltipContent>
						使用 {formatProviderLabel(provider)} API 规范
					</TooltipContent>
				</Tooltip>
			</div>
			<hr className="my-4 border-0 border-t border-solid border-border" />
			{isAPIKeyEnvManaged ? (
				<Alert severity="info">
					<AlertTitle>API 密钥由环境变量管理</AlertTitle>
					<AlertDescription>
						此提供商密钥由部署环境设置配置，无法在此界面中编辑。
					</AlertDescription>
				</Alert>
			) : (
				<form
					className="flex flex-1 flex-col"
					onSubmit={(event) => void handleSubmit(event)}
					autoComplete="off"
					data-form-type="other"
				>
					<div className="space-y-5">
						<ProviderField
							label="API 密钥"
							htmlFor={apiKeyInputId}
							required={requiresAPIKey}
							description={apiKeyDescription}
						>
							<div className="space-y-1.5">
								<Input
									id={apiKeyInputId}
									name="provider_api_token"
									type="password"
									autoComplete="off"
									data-1p-ignore
									data-lpignore="true"
									data-form-type="other"
									data-bwignore
									style={{ WebkitTextSecurity: "disc" } as CSSProperties}
									className="h-9 font-mono text-[13px]"
									placeholder={apiKeyPlaceholder}
									required={requiresAPIKey}
									value={apiKey}
									onFocus={handleApiKeyFocus}
									onChange={(event) => {
										setApiKey(event.target.value);
										setApiKeyTouched(true);
										setApiKeyModified(true);
									}}
									disabled={isDisabled}
								/>
								{hasAPIKeyWhitespace && (
									<p className="m-0 text-xs text-content-destructive">
										API 密钥不能包含前导或尾部空格。
									</p>
								)}
								{isBedrockProvider &&
									providerState.hasManagedAPIKey &&
									!isDisabled &&
									(!apiKeyModified || apiKey !== "") && (
										<div className="flex justify-end">
											<button
												type="button"
												className="appearance-none border-0 bg-transparent p-0 text-xs text-content-link hover:cursor-pointer hover:underline"
												onClick={() => {
													setApiKey("");
													setApiKeyTouched(true);
													setApiKeyModified(true);
												}}
											>
												清除已存储的令牌
											</button>
										</div>
									)}
							</div>
						</ProviderField>

						<ProviderField
							label="基础 URL"
							htmlFor={baseURLInputId}
							description={baseURLDescription}
						>
							<Input
								id={baseURLInputId}
								name="provider_base_url"
								className="h-9 text-[13px]"
								placeholder={baseURLPlaceholder}
								required
								autoComplete="off"
								value={baseURLValue}
								onChange={(event) => setBaseURLValue(event.target.value)}
								disabled={isDisabled}
							/>
						</ProviderField>
					</div>
					<div className="mt-auto pt-6">
						<hr className="mb-4 border-0 border-t border-solid border-border" />
						<div className="flex items-center justify-between">
							{providerConfig ? (
								<Button
									variant="outline"
									size="lg"
									type="button"
									className="text-content-secondary hover:text-content-destructive hover:border-border-destructive"
									disabled={isDisabled}
									onClick={() => setConfirmingDelete(true)}
								>
									删除
								</Button>
							) : (
								<div />
							)}
							<div className="flex items-center gap-2">
								{canAddModel && (
									<Button size="lg" type="button" onClick={handleAddModel}>
										添加模型
									</Button>
								)}
								<Button
									size="lg"
									type="submit"
									variant={canAddModel ? "outline" : undefined}
									disabled={!canSave}
								>
									{isProviderMutationPending && (
										<Spinner className="h-4 w-4" loading />
									)}
									{providerConfig ? "保存更改" : "创建提供商配置"}
								</Button>
							</div>
						</div>
					</div>
				</form>
			)}
			{providerConfig && (
				<ConfirmDeleteDialog
					entity="提供商"
					description={deleteProviderDescription}
					onConfirm={() => void onDeleteProvider(providerConfig.id)}
					isPending={isProviderMutationPending}
					open={confirmingDelete}
					onOpenChange={(open) => !open && setConfirmingDelete(false)}
				/>
			)}
		</div>
	);
};
interface ProviderFieldProps {
	label: string;
	htmlFor?: string;
	required?: boolean;
	description?: string;
	children: ReactNode;
}

export const ProviderField: FC<ProviderFieldProps> = ({
	label,
	htmlFor,
	required,
	description,
	children,
}) => (
	<div className="grid gap-1.5">
		<div className="flex items-baseline gap-1.5">
			<label
				htmlFor={htmlFor}
				className="text-sm font-medium text-content-primary"
			>
				{label}
			</label>
			{required && (
				<span className="text-xs font-bold text-content-destructive">*</span>
			)}
		</div>
		{description && (
			<p className="m-0 text-xs text-content-secondary">{description}</p>
		)}
		{children}
	</div>
);
