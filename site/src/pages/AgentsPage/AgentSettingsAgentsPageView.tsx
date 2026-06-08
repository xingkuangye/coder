import type { FC } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import {
	AdminPersonalModelOverridesSettings,
	type SavePersonalModelOverridesAdminSetting,
} from "./components/AdminPersonalModelOverridesSettings";
import { SectionHeader } from "./components/SectionHeader";
import {
	type MutationCallbacks,
	SubagentModelOverrideSettings,
} from "./components/SubagentModelOverrideSettings";

type SaveModelOverride = (
	req: { readonly model_config_id: string },
	options?: MutationCallbacks,
) => void;

export interface AgentSettingsAgentsPageViewProps {
	adminOverridesData?: TypesGen.ChatPersonalModelOverridesAdminSettings;
	adminOverridesError?: unknown;
	onRetryAdminOverrides?: () => void;
	isRetryingAdminOverrides?: boolean;
	onSaveAdminOverrides: SavePersonalModelOverridesAdminSetting;
	isSavingAdminOverrides: boolean;
	isSaveAdminOverridesError: boolean;
	generalModelOverrideData?: TypesGen.ChatModelOverrideResponse;
	titleGenerationModelOverrideData?: TypesGen.ChatModelOverrideResponse;
	exploreModelOverrideData?: TypesGen.ChatModelOverrideResponse;
	modelConfigsData: TypesGen.ChatModelConfig[] | undefined;
	modelConfigsError: unknown;
	isLoadingModelConfigs: boolean;
	onSaveGeneralModelOverride?: SaveModelOverride;
	isSavingGeneralModelOverride?: boolean;
	isSaveGeneralModelOverrideError?: boolean;
	onSaveTitleGenerationModel: SaveModelOverride;
	isSavingTitleGenerationModel: boolean;
	isSaveTitleGenerationModelError: boolean;
	onSaveExploreModelOverride: SaveModelOverride;
	isSavingExploreModelOverride: boolean;
	isSaveExploreModelOverrideError: boolean;
}

export const AgentSettingsAgentsPageView: FC<
	AgentSettingsAgentsPageViewProps
> = ({
	adminOverridesData,
	adminOverridesError,
	onRetryAdminOverrides,
	isRetryingAdminOverrides,
	onSaveAdminOverrides,
	isSavingAdminOverrides,
	isSaveAdminOverridesError,
	generalModelOverrideData,
	titleGenerationModelOverrideData,
	exploreModelOverrideData,
	modelConfigsData,
	modelConfigsError,
	isLoadingModelConfigs,
	onSaveGeneralModelOverride,
	isSavingGeneralModelOverride = false,
	isSaveGeneralModelOverrideError = false,
	onSaveTitleGenerationModel,
	isSavingTitleGenerationModel,
	isSaveTitleGenerationModelError,
	onSaveExploreModelOverride,
	isSavingExploreModelOverride,
	isSaveExploreModelOverrideError,
}) => {
	const enabledModelConfigs = (modelConfigsData ?? []).filter(
		(modelConfig) => modelConfig.enabled,
	);
	const showGeneralModelSection =
		onSaveGeneralModelOverride !== undefined ||
		generalModelOverrideData !== undefined ||
		isSavingGeneralModelOverride ||
		isSaveGeneralModelOverrideError;

	return (
		<div className="flex flex-col gap-8">
			<SectionHeader
				label="代理"
				description="配置委托代理及其他代理特定功能的默认选项。"
			/>
			<AdminPersonalModelOverridesSettings
				adminSettings={adminOverridesData}
				adminSettingsError={adminOverridesError}
				onRetryAdminSettings={onRetryAdminOverrides}
				isRetryingAdminSettings={isRetryingAdminOverrides}
				onSaveAdminSetting={onSaveAdminOverrides}
				isSavingAdminSetting={isSavingAdminOverrides}
				isSaveAdminSettingError={isSaveAdminOverridesError}
			/>
			{showGeneralModelSection && onSaveGeneralModelOverride && (
				<section aria-label="通用模型" className="flex flex-col gap-3">
					<SectionHeader
						label="通用模型"
						description="针对具有写入功能（例如在工作区中编辑文件或运行命令）的委托子代理的部署级模型覆盖。"
						level="section"
					/>
					<SubagentModelOverrideSettings
						title="通用模型"
						description="针对具有写入功能（例如在工作区中编辑文件或运行命令）的委托子代理的部署级模型覆盖。"
						modelOverrideData={generalModelOverrideData}
						enabledModelConfigs={enabledModelConfigs}
						modelConfigsError={modelConfigsError}
						isLoading={isLoadingModelConfigs}
						onSaveModelOverride={onSaveGeneralModelOverride}
						isSaving={isSavingGeneralModelOverride}
						isSaveError={isSaveGeneralModelOverrideError}
						saveErrorMessage="保存通用模型覆盖失败。"
						showHeader={false}
					/>
				</section>
			)}
			<section
				aria-label="标题生成模型"
				className="flex flex-col gap-3"
			>
				<SectionHeader
					label="标题生成模型"
					description="选择用于生成聊天标题的模型。不设置则使用 Coder 的默认标题算法，该算法当前会首先尝试已配置提供商的快速标题模型，例如 Claude Haiku、GPT-4o mini 和 Gemini Flash，然后回退到聊天的当前模型。在此处选择模型后，Coder 将仅使用该模型进行标题生成。推荐的标题模型速度较快且成本较低。"
					level="section"
				/>
				<SubagentModelOverrideSettings
					title="标题生成模型"
					description="选择用于生成聊天标题的模型。"
					modelOverrideData={titleGenerationModelOverrideData}
					enabledModelConfigs={enabledModelConfigs}
					modelConfigsError={modelConfigsError}
					isLoading={isLoadingModelConfigs}
					onSaveModelOverride={onSaveTitleGenerationModel}
					isSaving={isSavingTitleGenerationModel}
					isSaveError={isSaveTitleGenerationModelError}
					saveErrorMessage="保存标题生成模型失败。"
					unsetPlaceholder="使用标题默认值"
					unavailableModelWarning="所选模型当前不可用。在您选择另一模型或清除此设置之前，将跳过标题生成。"
					showHeader={false}
				/>
			</section>
			<section
				aria-label="探索子代理模型"
				className="flex flex-col gap-3"
			>
				<SectionHeader
					label="探索子代理模型"
					description="针对只读探索子代理的部署级模型覆盖。"
					level="section"
				/>
				<SubagentModelOverrideSettings
					title="探索子代理模型"
					description={
						<>
							针对通过 <code>spawn_agent</code> 工具并使用{" "}
							<code>type=explore</code> 参数启动的只读探索子代理的部署级模型覆盖。
						</>
					}
					modelOverrideData={exploreModelOverrideData}
					enabledModelConfigs={enabledModelConfigs}
					modelConfigsError={modelConfigsError}
					isLoading={isLoadingModelConfigs}
					onSaveModelOverride={onSaveExploreModelOverride}
					isSaving={isSavingExploreModelOverride}
					isSaveError={isSaveExploreModelOverrideError}
					saveErrorMessage="保存探索模型覆盖失败。"
					showHeader={false}
				/>
			</section>
		</div>
	);
};
