import { useEffect, useEffectEvent } from "react";
import { useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { watchAgentContainers } from "#/api/api";
import {
	workspaceAgentContainers,
	workspaceAgentContainersKey,
} from "#/api/queries/workspaces";
import type {
	WorkspaceAgent,
	WorkspaceAgentDevcontainer,
	WorkspaceAgentListContainersResponse,
} from "#/api/typesGenerated";

export function useAgentContainers(
	agent: WorkspaceAgent,
): readonly WorkspaceAgentDevcontainer[] | undefined {
	const queryClient = useQueryClient();
	const queryKey = workspaceAgentContainersKey(agent.id);

	const {
		data: devcontainers,
		error: queryError,
		isLoading: queryIsLoading,
	} = useQuery({
		...workspaceAgentContainers(agent),
		select: (res) => res.devcontainers,
	});

	const updateDevcontainersCache = useEffectEvent(
		async (data: WorkspaceAgentListContainersResponse) => {
			queryClient.setQueryData(queryKey, data);
		},
	);

	useEffect(() => {
		if (agent.status !== "connected" || queryIsLoading || queryError) {
			return;
		}

		const socket = watchAgentContainers(agent.id);

		socket.addEventListener("message", (event) => {
			if (event.parseError) {
				toast.error("容器更新失败。", {
					description: "请尝试刷新页面。",
				});
				return;
			}

			updateDevcontainersCache(event.parsedMessage);
		});

		socket.addEventListener("error", () => {
			toast.error("容器加载失败。", {
				description: "请尝试刷新页面。",
			});
		});

		return () => socket.close();
	}, [agent.id, agent.status, queryIsLoading, queryError]);

	return devcontainers;
}
