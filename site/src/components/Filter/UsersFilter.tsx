import type { FC } from "react";
import {
	Filter,
	MenuSkeleton,
	type useFilter,
} from "#/components/Filter/Filter";
import {
	type UseFilterMenuOptions,
	useFilterMenu,
} from "#/components/Filter/menu";
import {
	SelectFilter,
	type SelectFilterOption,
} from "#/components/Filter/SelectFilter";
import { StatusIndicatorDot } from "#/components/StatusIndicator/StatusIndicator";
import { docs } from "#/utils/docs";

const userFilterQuery = {
	active: "status:active",
	serviceAccount: "service_account:true",
	all: "",
};

export const useStatusFilterMenu = ({
	value,
	onChange,
}: Pick<UseFilterMenuOptions, "value" | "onChange">) => {
	const statusOptions: SelectFilterOption[] = [
		{
			value: "active",
			label: "活跃",
			startIcon: <StatusIndicatorDot variant="success" />,
		},
		{
			value: "dormant",
			label: "休眠",
			startIcon: <StatusIndicatorDot variant="warning" />,
		},
		{
			value: "suspended",
			label: "已停用",
			startIcon: <StatusIndicatorDot variant="inactive" />,
		},
	];
	return useFilterMenu({
		onChange,
		value,
		id: "status",
		getSelectedOption: async () =>
			statusOptions.find((option) => option.value === value) ?? null,
		getOptions: async () => statusOptions,
	});
};

type StatusFilterMenu = ReturnType<typeof useStatusFilterMenu>;

const PRESET_FILTERS = [
	{ query: userFilterQuery.active, name: "活跃用户" },
	{ query: userFilterQuery.serviceAccount, name: "服务账户" },
	{ query: userFilterQuery.all, name: "所有用户" },
];

interface UsersFilterProps {
	filter: ReturnType<typeof useFilter>;
	error?: unknown;
	menus?: {
		status?: StatusFilterMenu;
	};
}

export const UsersFilter: FC<UsersFilterProps> = ({ filter, error, menus }) => {
	return (
		<Filter
			presets={PRESET_FILTERS}
			learnMoreLink={docs("/admin/users#user-filtering")}
			learnMoreLabel2="用户状态"
			learnMoreLink2={docs("/admin/users#user-status")}
			isLoading={menus?.status?.isInitializing ?? false}
			filter={filter}
			error={error}
			options={menus?.status && <StatusMenu {...menus.status} />}
			optionsSkeleton={menus?.status && <MenuSkeleton />}
		/>
	);
};

const StatusMenu = (menu: StatusFilterMenu) => {
	return (
		<SelectFilter
			label="选择状态"
			placeholder="全部状态"
			options={menu.searchOptions}
			onSelect={menu.selectOption}
			selectedOption={menu.selectedOption ?? undefined}
		/>
	);
};
