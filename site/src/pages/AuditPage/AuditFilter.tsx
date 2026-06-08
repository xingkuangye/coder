import capitalize from "lodash/capitalize";
import type { FC } from "react";
import { AuditActions, ResourceTypes } from "#/api/typesGenerated";
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
import {
	DEFAULT_USER_FILTER_WIDTH,
	type UserFilterMenu,
	UserMenu,
} from "#/components/Filter/UserFilter";
import {
	type OrganizationsFilterMenu,
	OrganizationsMenu,
} from "#/modules/tableFiltering/options";
import { docs } from "#/utils/docs";

const PRESET_FILTERS = [
	{
		query: "resource_type:workspace action:create",
		name: "创建工作空间",
	},
	{ query: "resource_type:template action:create", name: "添加模板" },
	{ query: "resource_type:user action:delete", name: "删除用户" },
	{
		query: "resource_type:workspace_build action:start build_reason:initiator",
		name: "用户启动的构建",
	},
	{
		query: "resource_type:api_key action:login",
		name: "用户登录",
	},
];

interface AuditFilterProps {
	filter: ReturnType<typeof useFilter>;
	error?: unknown;
	menus: {
		user: UserFilterMenu;
		action: ActionFilterMenu;
		resourceType: ResourceTypeFilterMenu;
		// The organization menu is only provided in a multi-org setup.
		organization?: OrganizationsFilterMenu;
	};
}

export const AuditFilter: FC<AuditFilterProps> = ({ filter, error, menus }) => {
	const width = menus.organization ? DEFAULT_USER_FILTER_WIDTH : undefined;
	return (
		<Filter
			learnMoreLink={docs("/admin/security/audit-logs#filtering-logs")}
			presets={PRESET_FILTERS}
			isLoading={menus.user.isInitializing}
			filter={filter}
			error={error}
			options={
				<>
					<ResourceTypeMenu width={width} menu={menus.resourceType} />
					<ActionMenu width={width} menu={menus.action} />
					<UserMenu width={width} menu={menus.user} />
					{menus.organization && (
						<OrganizationsMenu width={width} menu={menus.organization} />
					)}
				</>
			}
			optionsSkeleton={
				<>
					<MenuSkeleton />
					<MenuSkeleton />
					<MenuSkeleton />
					{menus.organization && <MenuSkeleton />}
				</>
			}
		/>
	);
};

export const useActionFilterMenu = ({
	value,
	onChange,
}: Pick<UseFilterMenuOptions, "value" | "onChange">) => {
	const actionOptions: SelectFilterOption[] = AuditActions
		// TODO(ethanndickson): Logs with these action types are no longer produced.
		// Until we remove them from the database and API, we shouldn't suggest them
		// in the filter dropdown.
		.filter(
			(action) => !["connect", "disconnect", "open", "close"].includes(action),
		)
		.map((action) => ({
			value: action,
			label: capitalize(action),
		}));
	return useFilterMenu({
		onChange,
		value,
		id: "status",
		getSelectedOption: async () =>
			actionOptions.find((option) => option.value === value) ?? null,
		getOptions: async () => actionOptions,
	});
};

type ActionFilterMenu = ReturnType<typeof useActionFilterMenu>;

interface ActionMenuProps {
	menu: ActionFilterMenu;
	width?: number;
}

const ActionMenu: FC<ActionMenuProps> = ({ menu, width }) => {
	return (
		<SelectFilter
			label="选择操作"
			placeholder="所有操作"
			options={menu.searchOptions}
			onSelect={menu.selectOption}
			selectedOption={menu.selectedOption ?? undefined}
			width={width}
		/>
	);
};

export const useResourceTypeFilterMenu = ({
	value,
	onChange,
}: Pick<UseFilterMenuOptions, "value" | "onChange">) => {
	const actionOptions: SelectFilterOption[] = ResourceTypes.map((type) => {
		let label: string = capitalize(type);

		if (type === "api_key") {
			label = "API 密钥";
		}

		if (type === "git_ssh_key") {
			label = "Git SSH 密钥";
		}

		if (type === "template_version") {
			label = "模板版本";
		}

		if (type === "workspace_build") {
			label = "工作空间构建";
		}

		return {
			value: type,
			label,
		};
	});
	return useFilterMenu({
		onChange,
		value,
		id: "resourceType",
		getSelectedOption: async () =>
			actionOptions.find((option) => option.value === value) ?? null,
		getOptions: async () => actionOptions,
	});
};

type ResourceTypeFilterMenu = ReturnType<typeof useResourceTypeFilterMenu>;

interface ResourceTypeMenuProps {
	menu: ResourceTypeFilterMenu;
	width?: number;
}

const ResourceTypeMenu: FC<ResourceTypeMenuProps> = ({ menu, width }) => {
	return (
		<SelectFilter
			label="选择资源类型"
			placeholder="所有资源类型"
			options={menu.searchOptions}
			onSelect={menu.selectOption}
			selectedOption={menu.selectedOption ?? undefined}
			width={width}
		/>
	);
};
