import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import {
	setWorkspaceGroupRole,
	setWorkspaceUserRole,
	workspaceACL,
} from "#/api/queries/workspaces";
import type {
	Group,
	Workspace,
	WorkspaceGroup,
	WorkspaceRole,
	WorkspaceUser,
} from "#/api/typesGenerated";

/**
 * 封装了工作区共享的所有数据获取和修改操作。
 * 此钩子管理工作区 ACL 查询，并提供添加、更新和移除工作区用户和群组的方法。
 */
export function useWorkspaceSharing(workspace: Workspace) {
	const queryClient = useQueryClient();
	const [hasRemovedMember, setHasRemovedMember] = useState(false);

	const workspaceACLQuery = useQuery(workspaceACL(workspace.id));

	const addUserMutation = useMutation(setWorkspaceUserRole(queryClient));
	const updateUserMutation = useMutation(setWorkspaceUserRole(queryClient));
	const removeUserMutation = useMutation(setWorkspaceUserRole(queryClient));

	const addGroupMutation = useMutation(setWorkspaceGroupRole(queryClient));
	const updateGroupMutation = useMutation(setWorkspaceGroupRole(queryClient));
	const removeGroupMutation = useMutation(setWorkspaceGroupRole(queryClient));

	const addUser = async (
		user: WorkspaceUser,
		role: WorkspaceRole,
		reset: () => void,
	) => {
		const mutation = addUserMutation.mutateAsync({
			workspaceId: workspace.id,
			userId: user.id,
			role,
		});
		toast.promise(mutation, {
			loading: `正在将 ${user.username} 添加到工作区...`,
			success: `已将“${user.username}”添加到工作区。`,
		});
		reset();
	};

	const updateUser = async (user: WorkspaceUser, role: WorkspaceRole) => {
		await updateUserMutation.mutateAsync({
			workspaceId: workspace.id,
			userId: user.id,
			role,
		});
		toast.success(`“${user.username}”的角色已更新。`);
	};

	const removeUser = async (user: WorkspaceUser) => {
		await removeUserMutation.mutateAsync({
			workspaceId: workspace.id,
			userId: user.id,
			role: "",
		});
		setHasRemovedMember(true);
		toast.success(`“${user.username}”已移除。`);
	};

	const addGroup = async (
		group: Group,
		role: WorkspaceRole,
		reset: () => void,
	) => {
		await addGroupMutation.mutateAsync({
			workspaceId: workspace.id,
			groupId: group.id,
			role,
		});
		setHasRemovedMember(false);
		toast.success(`已将群组“${group.name}”添加到工作区。`);
		reset();
	};

	const updateGroup = async (group: WorkspaceGroup, role: WorkspaceRole) => {
		await updateGroupMutation.mutateAsync({
			workspaceId: workspace.id,
			groupId: group.id,
			role,
		});
		toast.success(`群组角色“${role}”已更新。`);
	};

	const removeGroup = async (group: Group) => {
		await removeGroupMutation.mutateAsync({
			workspaceId: workspace.id,
			groupId: group.id,
			role: "",
		});
		setHasRemovedMember(true);
		toast.success(`群组“${group.name}”已移除。`);
	};

	const mutationError =
		addUserMutation.error ??
		updateUserMutation.error ??
		removeUserMutation.error ??
		addGroupMutation.error ??
		updateGroupMutation.error ??
		removeGroupMutation.error;

	return {
		workspaceACL: workspaceACLQuery.data,
		isLoading: workspaceACLQuery.isLoading,
		error: workspaceACLQuery.error,
		mutationError,
		hasRemovedMember,
		// User actions
		addUser,
		updateUser,
		removeUser,
		isAddingUser: addUserMutation.isPending,
		updatingUserId: updateUserMutation.isPending
			? updateUserMutation.variables?.userId
			: undefined,
		// Group actions
		addGroup,
		updateGroup,
		removeGroup,
		isAddingGroup: addGroupMutation.isPending,
		updatingGroupId: updateGroupMutation.isPending
			? updateGroupMutation.variables?.groupId
			: undefined,
	} as const;
}
