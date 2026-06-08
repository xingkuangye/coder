import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { ImageLightbox } from "../../ImageLightbox";
import { ToolCollapsible } from "./ToolCollapsible";
import { ToolIcon } from "./ToolIcon";
import type { ToolStatus } from "./utils";

/**
 * 渲染 Anthropic 计算机使用工具返回的截图。
 * 当结果包含 base64 图像数据时，会显示实际图像而非原始 JSON。
 * 点击图像会在应用内灯箱叠加层中打开，而不是在新标签页中打开，
 * 以确保在 PWA / iOS 独立模式下正常工作。
 */
export const ComputerTool: React.FC<{
	imageData: string;
	mimeType: string;
	text: string;
	status: ToolStatus;
	isError: boolean;
	errorMessage?: string;
}> = ({ imageData, mimeType, text, status, isError, errorMessage }) => {
	const [showLightbox, setShowLightbox] = useState(false);
	const isRunning = status === "running";
	const hasImage = imageData.length > 0;
	const hasText = text.length > 0;
	const hasContent = hasImage || hasText;
	const imageSrc = hasImage ? `data:${mimeType};base64,${imageData}` : "";

	return (
		<ToolCollapsible
			className="w-full"
			hasContent={hasContent}
			defaultExpanded={hasImage}
			header={
				<>
					<ToolIcon name="computer" isError={isError} isRunning={isRunning} />
					<span className="text-[13px] leading-6">
						{isRunning ? "正在截图…" : "截图"}
					</span>
				</>
			}
			headerStatus={
				<>
					{isError && (
						<Tooltip>
							<TooltipTrigger asChild>
								<TriangleAlertIcon className="size-3.5 shrink-0 text-current" />
							</TooltipTrigger>
							<TooltipContent>
								{errorMessage || "截图失败"}
							</TooltipContent>
						</Tooltip>
					)}
					{isRunning && (
						<LoaderIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none text-current" />
					)}
				</>
			}
		>
			{hasImage ? (
				<>
					<div className="mt-1.5 overflow-hidden rounded-md border border-solid border-border-default">
						<button
							type="button"
							className="cursor-pointer bg-transparent p-0 border-none"
							onClick={() => setShowLightbox(true)}
						>
							<img
								src={imageSrc}
								alt="来自电脑工具的截图"
								className="max-h-96 w-auto object-contain"
							/>
						</button>
					</div>
					{showLightbox && (
						<ImageLightbox
							src={imageSrc}
							onClose={() => setShowLightbox(false)}
						/>
					)}
				</>
			) : hasText ? (
				<div className="mt-1.5 rounded-md border border-solid border-border-default px-3 py-2">
					<pre className="whitespace-pre-wrap text-xs text-content-secondary">
						{text}
					</pre>
				</div>
			) : null}
		</ToolCollapsible>
	);
};
