import type { FC, FormEvent } from "react";
import { useId, useState } from "react";
import type {
	ChatModelConfig,
	UserChatProviderConfig,
} from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Badge } from "#/components/Badge/Badge";
import { Button } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Input } from "#/components/Input/Input";
import { Loader } from "#/components/Loader/Loader";
import { SectionHeader } from "./components/SectionHeader";

const API_KEY_PLACEHOLDER = "••••••••••••••••";

type ProviderStatus = {
	label: string;
	variant: "default" | "green" | "warning";
	note?: string;
};

const getProviderStatus = (
	provider: UserChatProviderConfig,
): ProviderStatus => {
	if (!provider.byok_enabled) {
		return {
			label: "用户密钥已禁用",
			variant: "default",
			note: "个人 API 密钥已被管理员禁用。",
		};
	}

	if (provider.has_user_api_key) {
		return {
			label: "密钥已保存",
			variant: "green",
		};
	}

	if (provider.has_central_api_key_fallback) {
		return {
			label: "使用共享密钥",
			variant: "default",
			note: "当前正在使用共享部署密钥。添加个人密钥以使用您自己的密钥。",
		};
	}

	return {
		label: "无密钥",
		variant: "warning",
		note: "您必须添加个人 API 密钥才能使用此提供程序。",
	};
};

interface ProviderKeyPanelProps {
	provider: UserChatProviderConfig;
	models: readonly ChatModelConfig[];
	isModelsLoading: boolean;
	areModelsUnavailable: boolean;
	isSaving: boolean;
	isRemoving: boolean;
	onSave: (providerConfigId: string, apiKey: string) => void;
	onRemove: (providerConfigId: string) => void;
	hasAmbiguousProviderType: boolean;
}

const ProviderKeyPanel: FC<ProviderKeyPanelProps> = ({
	provider,
	models,
	hasAmbiguousProviderType,
	isModelsLoading,
	areModelsUnavailable,
	isSaving,
	isRemoving,
	onSave,
	onRemove,
}) => {
	const apiKeyInputId = useId();
	const [apiKey, setApiKey] = useState(
		provider.has_user_api_key ? API_KEY_PLACEHOLDER : "",
	);
	const [apiKeyTouched, setApiKeyTouched] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const status = getProviderStatus(provider);
	const enabledModels = models.filter((model) => {
		return (
			model.enabled &&
			(model.ai_provider_id === provider.provider_id ||
				(!model.ai_provider_id &&
					!hasAmbiguousProviderType &&
					model.provider === provider.provider))
		);
	});
	const hasApiKeyValue = apiKey.trim().length > 0;
	const hasAPIKeyWhitespace =
		apiKey !== API_KEY_PLACEHOLDER && apiKey.trim() !== apiKey;
	const saveDisabled =
		!provider.byok_enabled ||
		!hasApiKeyValue ||
		hasAPIKeyWhitespace ||
		apiKey === API_KEY_PLACEHOLDER ||
		isSaving ||
		isRemoving;
	const inputDisabled = !provider.byok_enabled || isSaving || isRemoving;
	const removeDisabled = isSaving || isRemoving;
	const providerName = provider.display_name || provider.provider;

	const handleApiKeyFocus = () => {
		if (!apiKeyTouched && apiKey === API_KEY_PLACEHOLDER) {
			setApiKey("");
			setApiKeyTouched(true);
		}
	};

	const handleSave = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (saveDisabled) {
			return;
		}

		onSave(provider.provider_id, apiKey);
	};

	const handleRemoveKey = () => {
		onRemove(provider.provider_id);
	};

	const deleteDescription = provider.has_central_api_key_fallback
		? "这将删除您的个人 API 密钥。请求将回退到此提供程序的共享部署密钥。"
		: "这将删除您的个人 API 密钥。您需要添加新密钥才能再次使用此提供程序。";

	return (
		<article className="rounded-lg border border-solid border-border p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<h5 className="m-0 text-lg font-medium text-content-primary">
						{providerName}
					</h5>
					{status.note && (
						<p className="m-0 text-sm text-content-secondary">{status.note}</p>
					)}
				</div>
				<Badge size="sm" variant={status.variant} className="w-fit">
					{status.label}
				</Badge>
			</div>

			<form className="mt-6 flex flex-col gap-3" onSubmit={handleSave}>
				<label
					htmlFor={apiKeyInputId}
					className="text-sm font-medium text-content-primary"
				>
					API 密钥
				</label>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-start">
					<div className="flex flex-col gap-1.5 lg:flex-1">
						<Input
							id={apiKeyInputId}
							name={`provider-api-key-${provider.provider_id}`}
							type="password"
							autoComplete="off"
							data-1p-ignore
							data-lpignore="true"
							data-form-type="other"
							data-bwignore
							className="h-9 font-mono text-[13px]"
							placeholder="sk-..."
							value={apiKey}
							onFocus={handleApiKeyFocus}
							onChange={(event) => {
								setApiKey(event.target.value);
								setApiKeyTouched(true);
							}}
							disabled={inputDisabled}
						/>
						{hasAPIKeyWhitespace && (
							<p className="m-0 text-xs text-content-destructive">
								API 密钥不得包含前导或尾随空格。
							</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button type="submit" size="sm" disabled={saveDisabled}>
							保存
						</Button>
						{provider.has_user_api_key && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setIsDeleteDialogOpen(true)}
								disabled={removeDisabled}
							>
								删除
							</Button>
						)}
					</div>
				</div>
			</form>

			<div className="mt-6 flex flex-col gap-2">
				<p className="m-0 text-sm font-medium text-content-primary">
					已启用的模型
				</p>
				{areModelsUnavailable ? (
					<p className="m-0 text-sm text-content-secondary">
						已启用的模型徽章暂时不可用。
					</p>
				) : isModelsLoading ? (
					<p className="m-0 text-sm text-content-secondary">
						正在加载模型...
					</p>
				) : enabledModels.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{enabledModels.map((model) => (
							<Badge key={model.id} size="xs" variant="default">
								{model.display_name || model.model}
							</Badge>
						))}
					</div>
				) : (
					<p className="m-0 text-sm text-content-secondary">
						未配置已启用的模型。
					</p>
				)}
			</div>

			<ConfirmDialog
				open={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleRemoveKey}
				title="删除 API 密钥？"
				description={deleteDescription}
				confirmText="删除"
				confirmLoading={isRemoving}
				type="delete"
			/>
		</article>
	);
};

interface AgentSettingsAPIKeysProviderItem {
	provider: UserChatProviderConfig;
	renderKey: string;
	isSaving: boolean;
	isRemoving: boolean;
}

export interface AgentSettingsAPIKeysPageViewProps {
	error: unknown;
	isLoading: boolean;
	providerItems: readonly AgentSettingsAPIKeysProviderItem[];
	models: readonly ChatModelConfig[];
	isModelsLoading: boolean;
	areModelsUnavailable: boolean;
	onSave: (providerConfigId: string, apiKey: string) => void;
	onRemove: (providerConfigId: string) => void;
}

export const AgentSettingsAPIKeysPageView: FC<
	AgentSettingsAPIKeysPageViewProps
> = ({
	error,
	isLoading,
	providerItems,
	models,
	isModelsLoading,
	areModelsUnavailable,
	onSave,
	onRemove,
}) => {
	const providerTypeCounts = new Map<string, number>();
	for (const item of providerItems) {
		providerTypeCounts.set(
			item.provider.provider,
			(providerTypeCounts.get(item.provider.provider) ?? 0) + 1,
		);
	}

	return (
		<div>
			<section className="flex flex-col gap-8">
				<SectionHeader
					label="密钥（API 密钥）"
					description="为每个提供程序添加个人 API 密钥。当两者都可用时，您的个人密钥优先于共享部署密钥。"
				/>
				<div>
					{error ? (
						<ErrorAlert error={error} />
					) : isLoading ? (
						<Loader />
					) : providerItems.length === 0 ? (
						<EmptyState
							message="没有提供程序允许个人 API 密钥。"
							description="请向管理员申请至少为一个提供程序启用个人 API 密钥。"
						/>
					) : (
						<div className="flex flex-col gap-4">
							{providerItems.map((item) => (
								<ProviderKeyPanel
									key={item.renderKey}
									provider={item.provider}
									models={models}
									isModelsLoading={isModelsLoading}
									areModelsUnavailable={areModelsUnavailable}
									isSaving={item.isSaving}
									isRemoving={item.isRemoving}
									onSave={onSave}
									onRemove={onRemove}
									hasAmbiguousProviderType={
										(providerTypeCounts.get(item.provider.provider) ?? 0) > 1
									}
								/>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
};
