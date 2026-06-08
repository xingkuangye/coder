import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { watchBuildLogsByBuildId } from "#/api/api";
import type { ProvisionerJobLog } from "#/api/typesGenerated";

export const useWorkspaceBuildLogs = (
	// buildId is optional because sometimes the build is not loaded yet
	buildId: string | undefined,
	enabled = true,
) => {
	const [logs, setLogs] = useState<ProvisionerJobLog[]>();
	const socket = useRef<WebSocket>(undefined);

	useEffect(() => {
		if (!buildId || !enabled) {
			socket.current?.close();
			return;
		}

		// Every time this hook is called reset the values
		setLogs(undefined);

		socket.current = watchBuildLogsByBuildId(buildId, {
			// Retrieve all the logs
			after: -1,
			onMessage: (log) => {
				setLogs((previousLogs) => {
					if (!previousLogs) {
						return [log];
					}
					return [...previousLogs, log];
				});
			},
			onError: () => {
				toast.error(`获取构建日志“${buildId}”时出错。`);
			},
		});

		return () => {
			socket.current?.close();
		};
	}, [buildId, enabled]);

	return logs;
};
