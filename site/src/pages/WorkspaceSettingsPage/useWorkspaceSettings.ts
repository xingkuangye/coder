import { createContext, useContext } from "react";
import type { Workspace } from "#/api/typesGenerated";
import type { WorkspacePermissions } from "#/modules/workspaces/permissions";

type WorkspaceSettingsContext = {
	owner: string;
	workspace: Workspace;
	permissions?: WorkspacePermissions;
};

export const WorkspaceSettings = createContext<
	WorkspaceSettingsContext | undefined
>(undefined);

export function useWorkspaceSettings() {
	const value = useContext(WorkspaceSettings);
	if (!value) {
		throw new Error(
			"此钩子只能在工作区设置页面中使用",
		);
	}

	return value;
}
