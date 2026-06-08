import type { FC } from "react";
import {
	Filter,
	MenuSkeleton,
	type useFilter,
} from "#/components/Filter/Filter";
import { type UserFilterMenu, UserMenu } from "#/components/Filter/UserFilter";
import { ClientFilter, type ClientFilterMenu } from "./ClientFilter";
import { ModelFilter, type ModelFilterMenu } from "./ModelFilter";
import { ProviderFilter, type ProviderFilterMenu } from "./ProviderFilter";

interface RequestLogsFilterProps {
	filter: ReturnType<typeof useFilter>;
	error?: unknown;
	menus: {
		user: UserFilterMenu;
		provider: ProviderFilterMenu;
		model: ModelFilterMenu;
		client: ClientFilterMenu;
	};
}

export const RequestLogsFilter: FC<RequestLogsFilterProps> = ({
	filter,
	error,
	menus,
}) => {
	return (
		<Filter
			filter={filter}
			optionsSkeleton={<MenuSkeleton />}
			isLoading={menus.user.isInitializing}
			presets={[
				{
					name: "所有请求",
					query: "",
				},
				{
					name: "我的请求",
					query: "initiator:me",
				},
			]}
			error={error}
			options={
				<>
					<UserMenu menu={menus.user} placeholder="所有发起人" />
					<ProviderFilter menu={menus.provider} />
					<ModelFilter menu={menus.model} />
					<ClientFilter menu={menus.client} />
				</>
			}
		/>
	);
};
