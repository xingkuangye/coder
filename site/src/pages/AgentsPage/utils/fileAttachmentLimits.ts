import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { MaxChatFileSizeBytes } from "#/api/typesGenerated";

export const formatAgentAttachmentTooLargeError = (fileSize: number): string =>
	`文件过大（${(fileSize / 1024 / 1024).toFixed(1)} MiB）。最大为 ${MaxChatFileSizeBytes / 1024 / 1024} MiB。`;

export const formatAgentAttachmentUploadError = (error: unknown): string => {
	const message = getErrorMessage(error, "上传失败");
	const detail = getErrorDetail(error);
	return detail ? `${message}。${detail}` : message;
};

export const readAgentAttachmentText = (file: File): Promise<string> => {
	if (typeof file.text === "function") {
		return file.text();
	}
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () =>
			reject(reader.error ?? new Error("读取文件内容失败。"));
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
				return;
			}
			reject(new Error("读取文件内容失败。"));
		};
		reader.readAsText(file);
	});
};
