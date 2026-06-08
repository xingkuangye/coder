import type { FC } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import type { ModelSelectorOption } from "./components/ChatElements";
import {
	PersonalModelOverrideRow,
	type SavePersonalOverride,
} from "./components/PersonalModelOverrideRow";
import { SectionHeader } from "./components/SectionHeader";

export interface AgentSettingsUserAgentsPageViewProps {
	overridesData?: TypesGen.UserChatPersonalModelOverridesResponse;
	overridesError: unknown;
	onRetryOverrides?: () => void;
	isRetryingOverrides?: boolean;
	isLoadingOverrides: boolean;
	modelOptions: readonly ModelSelectorOption[];
	modelConfigs: readonly TypesGen.ChatModelConfig[];
	modelConfigsError: unknown;
	isLoadingModels: boolean;
	onSaveRootModelOverride: SavePersonalOverride;
	isSavingRootModelOverride: boolean;
	isSaveRootModelOverrideError: boolean;
	onSaveGeneralModelOverride: SavePersonalOverride;
	isSavingGeneralModelOverride: boolean;
	isSaveGeneralModelOverrideError: boolean;
	onSaveExploreModelOverride: SavePersonalOverride;
	isSavingExploreModelOverride: boolean;
	isSaveExploreModelOverrideError: boolean;
}

export const AgentSettingsUserAgentsPageView: FC<
	AgentSettingsUserAgentsPageViewProps
> = ({
	overridesData,
	overridesError,
	onRetryOverrides,
	isRetryingOverrides = false,
	isLoadingOverrides,
	modelOptions,
	modelConfigs,
	modelConfigsError,
	isLoadingModels,
	onSaveRootModelOverride,
	isSavingRootModelOverride,
	isSaveRootModelOverrideError,
	onSaveGeneralModelOverride,
	isSavingGeneralModelOverride,
	isSaveGeneralModelOverrideError,
	onSaveExploreModelOverride,
	isSavingExploreModelOverride,
	isSaveExploreModelOverrideError,
}) => {
	const personalOverridesEnabled = overridesData?.enabled ?? true;
	const isLoading = isLoadingOverrides || isLoadingModels;
	const isDisabled = isLoading || !personalOverridesEnabled;

	return (
		<div className="flex flex-col gap-8">
			<SectionHeader
				label="代理"
				description="为根代理和委派代理选择个人模型默认设置。"
			/>
			{overridesError ? (
				<div className="flex flex-col gap-2">
					<ErrorAlert error={overridesError} />
					{onRetryOverrides && (
						<Button
							disabled={isRetryingOverrides}
							onClick={onRetryOverrides}
							size="sm"
							type="button"
							variant="outline"
						>
							重试
						</Button>
					)}
				</div>
			) : null}
			{!personalOverridesEnabled && (
				<Alert severity="info">
					<AlertDescription>
						个人模型覆盖已被管理员禁用。保存的值仅供参考，无法保存更改。
					</AlertDescription>
				</Alert>
			)}
			<PersonalModelOverrideRow
				context="root"
				title="根代理模型"
				description="为新根代理选择模型行为。"
				overrideData={overridesData?.root}
				modelOptions={modelOptions}
				modelConfigs={modelConfigs}
				modelConfigsError={modelConfigsError}
				isLoading={isLoading}
				onSave={onSaveRootModelOverride}
				isSaving={isSavingRootModelOverride}
				isSaveError={isSaveRootModelOverrideError}
				saveErrorMessage="保存根代理模型覆盖失败。"
				disabled={isDisabled}
			/>
			<PersonalModelOverrideRow
				context="general"
				title="通用子代理模型"
				description="为具有写入能力的委派代理选择模型行为。"
				overrideData={overridesData?.general}
				deploymentDefault={overridesData?.deployment_defaults.general}
				modelOptions={modelOptions}
				modelConfigs={modelConfigs}
				modelConfigsError={modelConfigsError}
				isLoading={isLoading}
				onSave={onSaveGeneralModelOverride}
				isSaving={isSavingGeneralModelOverride}
				isSaveError={isSaveGeneralModelOverrideError}
				saveErrorMessage="保存通用子代理模型覆盖失败。"
				disabled={isDisabled}
			/>
			<PersonalModelOverrideRow
				context="explore"
				title="探索子代理模型"
				description="为只读探索子代理选择模型行为。"
				overrideData={overridesData?.explore}
				deploymentDefault={overridesData?.deployment_defaults.explore}
				modelOptions={modelOptions}
				modelConfigs={modelConfigs}
				modelConfigsError={modelConfigsError}
				isLoading={isLoading}
				onSave={onSaveExploreModelOverride}
				isSaving={isSavingExploreModelOverride}
				isSaveError={isSaveExploreModelOverrideError}
				saveErrorMessage="保存探索子代理模型覆盖失败。"
				disabled={isDisabled}
			/>
		</div>
	);
};
