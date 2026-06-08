import { saveAs } from "file-saver";
import { ChevronDownIcon, DownloadIcon, PackageIcon } from "lucide-react";
import { type FC, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { getErrorDetail } from "#/api/errors";
import { Button } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";

type DownloadableLogSet = {
	label: string;
	filenameSuffix: string;
	logsText: string;
	startIcon?: ReactNode;
};

type DownloadSelectedAgentLogsButtonProps = {
	agentName: string;
	logSets: readonly DownloadableLogSet[];
	allLogsText: string;
	disabled?: boolean;
	download?: (file: Blob, filename: string) => void | Promise<void>;
};

export const DownloadSelectedAgentLogsButton: FC<
	DownloadSelectedAgentLogsButtonProps
> = ({
	agentName,
	logSets,
	allLogsText,
	disabled = false,
	download = saveAs,
}) => {
	const [isDownloading, setIsDownloading] = useState(false);
	const downloadLogs = async (logsText: string, filenameSuffix: string) => {
		try {
			setIsDownloading(true);
			const file = new Blob([logsText], { type: "text/plain" });
			await download(file, `${agentName}-${filenameSuffix}.txt`);
		} catch (error) {
			toast.error(`下载 "${agentName}" 日志失败。`, {
				description: getErrorDetail(error),
			});
		} finally {
			setIsDownloading(false);
		}
	};

	const hasAllLogs = allLogsText.length > 0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="subtle"
					size="sm"
					disabled={disabled || isDownloading}
					className="min-w-0"
				>
					<DownloadIcon />
					<span className="sr-only">
						{isDownloading ? "下载中..." : "下载代理日志"}
					</span>
					<ChevronDownIcon className="size-icon-sm" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side="bottom"
				align="end"
				className="max-h-56 overflow-y-auto"
			>
				<DropdownMenuItem
					disabled={!hasAllLogs}
					onSelect={() => {
						downloadLogs(allLogsText, "all-logs");
					}}
				>
					<PackageIcon />
					下载所有日志
				</DropdownMenuItem>
				{logSets.map((logSet) => (
					<DropdownMenuItem
						key={logSet.filenameSuffix}
						disabled={logSet.logsText.length === 0}
						onSelect={() => {
							downloadLogs(logSet.logsText, logSet.filenameSuffix);
						}}
					>
						{logSet.startIcon}
						<span>下载 {logSet.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
