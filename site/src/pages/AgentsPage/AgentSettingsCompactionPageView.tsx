import type { FC } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { SectionHeader } from "./components/SectionHeader";
import { UserCompactionThresholdSettings } from "./components/UserCompactionThresholdSettings";

export interface AgentSettingsCompactionPageViewProps {
	modelConfigsData: TypesGen.ChatModelConfig[] | undefined;
	modelConfigsError: unknown;
	isLoadingModelConfigs: boolean;
	thresholds: readonly TypesGen.UserChatCompactionThreshold[] | undefined;
	isThresholdsLoading: boolean;
	thresholdsError: unknown;
	onSaveThreshold: (
		modelConfigId: string,
		thresholdPercent: number,
	) => Promise<unknown>;
	onResetThreshold: (modelConfigId: string) => Promise<unknown>;
}

export const AgentSettingsCompactionPageView: FC<
	AgentSettingsCompactionPageViewProps
> = ({
	modelConfigsData,
	modelConfigsError,
	isLoadingModelConfigs,
	thresholds,
	isThresholdsLoading,
	thresholdsError,
	onSaveThreshold,
	onResetThreshold,
}) => {
	return (
		<div className="flex flex-col gap-8">
			<SectionHeader
				label="压缩"
				description="自定义与模型的对话何时自动压缩。"
			/>
			<UserCompactionThresholdSettings
				modelConfigs={modelConfigsData ?? []}
				modelConfigsError={modelConfigsError}
				isLoadingModelConfigs={isLoadingModelConfigs}
				thresholds={thresholds}
				isThresholdsLoading={isThresholdsLoading}
				thresholdsError={thresholdsError}
				onSaveThreshold={onSaveThreshold}
				onResetThreshold={onResetThreshold}
			/>
		</div>
	);
};
