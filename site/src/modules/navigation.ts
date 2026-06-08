/**
 * @fileoverview 待办：将导航代码集中到此处！包括URL常量、URL格式化等全部内容。
 */

import { useCallback } from "react";
import type { DashboardValue } from "./dashboard/DashboardProvider";
import { useDashboard } from "./dashboard/useDashboard";

type LinkThunk = (state: DashboardValue) => string;

export function useLinks() {
	const dashboard = useDashboard();
	const get = useCallback(
		(thunk: LinkThunk): string => thunk(dashboard),
		[dashboard],
	);
	return get;
}

function withFilter(path: string, filter: string) {
	return path + (filter ? `?filter=${encodeURIComponent(filter)}` : "");
}

export const linkToAuditing = "/audit";

const _linkToUsers = withFilter("/deployment/users", "status:active");

export const linkToTemplate =
	(organizationName: string, templateName: string): LinkThunk =>
	(dashboard) =>
		dashboard.showOrganizations
			? `/templates/${organizationName}/${templateName}`
			: `/templates/${templateName}`;
