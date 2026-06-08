import { saveAs } from "file-saver";
import { DownloadIcon } from "lucide-react";
import { type FC, useState } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { getErrorDetail } from "#/api/errors";
import { agentLogs } from "#/api/queries/workspaces";
import type { WorkspaceAgent, WorkspaceAgentLog } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";

type DownloadAgentLogsButtonProps = {
	agent: Pick<WorkspaceAgent, "id" | "name" | "status" | "lifecycle_state">;
	download?: (file: Blob, filename: string) => void;
};

export const DownloadAgentLogsButton: FC<DownloadAgentLogsButtonProps> = ({
	agent,
	download = saveAs,
}) => {
	const queryClient = useQueryClient();
	const isConnected = agent.status === "connected";
	const [isDownloading, setIsDownloading] = useState(false);

	const fetchLogs = async () => {
		const queryOpts = agentLogs(agent.id);
		let logs = queryClient.getQueryData<WorkspaceAgentLog[]>(
			queryOpts.queryKey,
		);
		if (!logs) {
			logs = await queryClient.fetchQuery(queryOpts);
		}
		return logs;
	};

	return (
		<Button
			disabled={!isConnected || isDownloading}
			variant="subtle"
			size="sm"
			onClick={async () => {
				try {
					setIsDownloading(true);
					const logs = await fetchLogs();
					if (!logs) {
						throw new Error("未找到日志");
					}
					const text = logs.map((l) => l.output).join("\n");
					const file = new Blob([text], { type: "text/plain" });
					download(file, `${agent.name}-logs.txt`);
				} catch (error) {
					console.error(error);
					toast.error(`无法下载“${agent.name}”的日志。`, {
						description: getErrorDetail(error),
					});
				} finally {
					setIsDownloading(false);
				}
			}}
		>
			<DownloadIcon />
			{isDownloading ? "正在下载..." : "下载代理日志"}
		</Button>
	);
};
