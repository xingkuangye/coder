import type { FC } from "react";
import { API } from "#/api/api";
import { ComboboxInput } from "#/components/Combobox/Combobox";
import {
	type UseFilterMenuOptions,
	useFilterMenu,
} from "#/components/Filter/menu";
import { SelectFilter } from "#/components/Filter/SelectFilter";
import { AIBridgeModelIcon } from "../icons/AIBridgeModelIcon";

export const useModelFilterMenu = ({
	value,
	onChange,
	enabled,
}: Pick<UseFilterMenuOptions, "value" | "onChange" | "enabled">) => {
	return useFilterMenu({
		id: "model",
		getSelectedOption: async () => {
			const modelsRes = await API.getAIBridgeModels({
				q: value,
				limit: 1,
			});
			const firstModel = modelsRes.at(0);

			if (firstModel && firstModel === value) {
				return {
					label: firstModel,
					value: firstModel,
					startIcon: (
						<AIBridgeModelIcon model={firstModel} className="size-icon-sm" />
					),
				};
			}

			return null;
		},
		getOptions: async (query) => {
			const modelsRes = await API.getAIBridgeModels({
				q: query,
				limit: 25,
			});
			return modelsRes.map((model) => ({
				label: model,
				value: model,
				startIcon: <AIBridgeModelIcon model={model} className="size-icon-sm" />,
			}));
		},
		value,
		onChange,
		enabled,
	});
};

export type ModelFilterMenu = ReturnType<typeof useModelFilterMenu>;

interface ModelFilterProps {
	menu: ModelFilterMenu;
}

export const ModelFilter: FC<ModelFilterProps> = ({ menu }) => {
	return (
		<SelectFilter
			label="选择模型"
			placeholder="所有模型"
			emptyText="未找到模型"
			options={menu.searchOptions}
			onSelect={(option) => menu.selectOption(option)}
			selectedOption={menu.selectedOption ?? undefined}
			selectFilterSearch={
				<ComboboxInput
					placeholder="搜索模型..."
					value={menu.query}
					onValueChange={menu.setQuery}
				/>
			}
		/>
	);
};
