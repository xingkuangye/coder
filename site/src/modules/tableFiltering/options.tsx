/**
 * @file 定义 Coder UI 中跨多个页面相关的筛选下拉组的集中位置。
 *
 * @todo 2024-09-06 - 弄清楚如何将用户下拉组移入此文件
 * （或者是否由于存在足够的细微差异，不值得集中化逻辑）。我们目前对工作区和审计页面有两个独立的实现，存在不同步的风险。
 */

import type { FC } from "react";
import { API } from "#/api/api";
import { Avatar } from "#/components/Avatar/Avatar";
import { ComboboxInput } from "#/components/Combobox/Combobox";
import {
	type UseFilterMenuOptions,
	useFilterMenu,
} from "#/components/Filter/menu";
import {
	SelectFilter,
	type SelectFilterOption,
} from "#/components/Filter/SelectFilter";
// Organization helpers ////////////////////////////////////////////////////////

export const useOrganizationsFilterMenu = ({
	value,
	onChange,
}: Pick<UseFilterMenuOptions, "value" | "onChange">) => {
	return useFilterMenu({
		onChange,
		value,
		id: "organizations",
		getSelectedOption: async () => {
			if (value) {
				const organizations = await API.getOrganizations();
				const organization = organizations.find((o) => o.name === value);
				if (organization) {
					return {
						label: organization.display_name || organization.name,
						value: organization.name,
						startIcon: (
							<Avatar
								key={organization.id}
								size="sm"
								fallback={organization.display_name || organization.name}
								src={organization.icon}
							/>
						),
					};
				}
			}
			return null;
		},
		getOptions: async () => {
			// Only show the organizations for which you can view audit logs.
			const organizations = await API.getOrganizations();
			const permissions = await API.checkAuthorization({
				checks: Object.fromEntries(
					organizations.map((organization) => [
						organization.id,
						{
							object: {
								resource_type: "audit_log",
								organization_id: organization.id,
							},
							action: "read",
						},
					]),
				),
			});
			return organizations
				.filter((organization) => permissions[organization.id])
				.map<SelectFilterOption>((organization) => ({
					label: organization.display_name || organization.name,
					value: organization.name,
					startIcon: (
						<Avatar
							key={organization.id}
							size="sm"
							fallback={organization.display_name || organization.name}
							src={organization.icon}
						/>
					),
				}));
		},
	});
};

export type OrganizationsFilterMenu = ReturnType<
	typeof useOrganizationsFilterMenu
>;

interface OrganizationsMenuProps {
	menu: OrganizationsFilterMenu;
	width?: number;
}

export const OrganizationsMenu: FC<OrganizationsMenuProps> = ({
	menu,
	width,
}) => {
	return (
		<SelectFilter
			label="选择一个组织"
			placeholder="所有组织"
			emptyText="未找到组织"
			options={menu.searchOptions}
			onSelect={menu.selectOption}
			selectedOption={menu.selectedOption ?? undefined}
			selectFilterSearch={
				<ComboboxInput
					placeholder="搜索组织..."
					value={menu.query}
					onValueChange={menu.setQuery}
					aria-label="搜索组织"
				/>
			}
			width={width}
		/>
	);
};
