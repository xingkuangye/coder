import type { FC } from "react";
import { API } from "#/api/api";
import type { Organization } from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import {
	Filter,
	MenuSkeleton,
	type UseFilterResult,
} from "#/components/Filter/Filter";
import { useFilterMenu } from "#/components/Filter/menu";
import {
	SelectFilter,
	type SelectFilterOption,
} from "#/components/Filter/SelectFilter";
import {
	DEFAULT_USER_FILTER_WIDTH,
	type UserFilterMenu,
	UserMenu,
} from "#/components/Filter/UserFilter";
import { useDashboard } from "#/modules/dashboard/useDashboard";

interface TemplatesFilterProps {
	filter: UseFilterResult;
	error?: unknown;

	userMenu?: UserFilterMenu;
}

export const TemplatesFilter: FC<TemplatesFilterProps> = ({
	filter,
	error,
	userMenu,
}) => {
	const { showOrganizations } = useDashboard();
	const width = showOrganizations ? DEFAULT_USER_FILTER_WIDTH : undefined;
	const organizationMenu = useFilterMenu({
		onChange: (option) =>
			filter.update({ ...filter.values, organization: option?.value }),
		value: filter.values.organization,
		id: "organization",
		getSelectedOption: async () => {
			if (!filter.values.organization) {
				return null;
			}

			const org = await API.getOrganization(filter.values.organization);
			return orgOption(org);
		},
		getOptions: async () => {
			const orgs = await API.getMyOrganizations();
			return orgs.map(orgOption);
		},
	});

	return (
		<Filter
			presets={[
				{ query: "", name: "所有模板" },
				{ query: "author:me", name: "您创建的模板" },
				{ query: "deprecated:true", name: "已弃用的模板" },
			]}
			// TODO: Add docs for this
			// learnMoreLink={docs("/templates#template-filtering")}
			isLoading={false}
			filter={filter}
			error={error}
			options={
				<>
					{userMenu && <UserMenu width={width} menu={userMenu} />}
					<SelectFilter
						placeholder="所有组织"
						label="选择组织"
						options={organizationMenu.searchOptions}
						selectedOption={organizationMenu.selectedOption ?? undefined}
						onSelect={organizationMenu.selectOption}
					/>
				</>
			}
			optionsSkeleton={
				<>
					{userMenu && <MenuSkeleton />}
					<MenuSkeleton />
				</>
			}
		/>
	);
};

const orgOption = (org: Organization): SelectFilterOption => ({
	label: org.display_name || org.name,
	value: org.name,
	startIcon: (
		<Avatar key={org.id} size="sm" fallback={org.display_name} src={org.icon} />
	),
});
