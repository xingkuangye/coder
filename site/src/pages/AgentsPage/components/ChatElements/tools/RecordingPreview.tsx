import { ImageOffIcon, PlayIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { getChatFileURL } from "../../../utils/chatAttachments";
import { VideoLightbox } from "../../VideoLightbox";
import { DEFAULT_ASPECT, PREVIEW_HEIGHT } from "./previewConstants";

interface RecordingPreviewProps {
	/** MP4 录制的聊天文件 ID。 */
	recordingFileId: string;
	/** 已完成录制的 JPEG 缩略图文件 ID。 */
	thumbnailFileId?: string;
	/** 可选的视频 URL 覆盖。提供后，将直接使用该 URL，
	 * 而不是根据 recordingFileId 推导 URL。 */
	src?: string;
	/** 可选的缩略图 URL 覆盖。提供后，将直接使用该 URL，
	 * 而不是根据 thumbnailFileId 推导 URL。 */
	thumbnailSrc?: string;
}

/**
 * 内联录制缩略图，带有播放图标叠加层。点击预览将打开全屏
 * VideoLightbox，提供原生播放控件。如果缩略图加载失败，
 * 会显示“缩略图不可用”消息，但视频仍然可以播放。
 */
export const RecordingPreview: React.FC<RecordingPreviewProps> = ({
	recordingFileId,
	thumbnailFileId,
	src: srcOverride,
	thumbnailSrc: thumbnailSrcOverride,
}) => {
	const [showLightbox, setShowLightbox] = useState(false);
	const [thumbnailError, setThumbnailError] = useState(false);
	// Incremented each time the lightbox opens so the VideoLightbox
	// component remounts and resets its internal error state.
	const [lightboxKey, setLightboxKey] = useState(0);

	const videoSrc = srcOverride ?? getChatFileURL(recordingFileId);

	return (
		<div
			className="relative overflow-hidden rounded-lg border border-solid border-border-default"
			style={{ aspectRatio: DEFAULT_ASPECT, height: PREVIEW_HEIGHT }}
		>
			{thumbnailError ? (
				<div className="flex size-full items-center justify-center gap-1.5 bg-surface-secondary text-xs text-content-secondary">
					<ImageOffIcon className="size-3" />
					缩略图不可用
				</div>
			) : thumbnailFileId ? (
				<img
					src={thumbnailSrcOverride ?? getChatFileURL(thumbnailFileId)}
					alt="录制缩略图"
					className="size-full pointer-events-none object-cover"
					onError={() => setThumbnailError(true)}
				/>
			) : (
				// No thumbnail available — neutral gray placeholder.
				<div className="size-full bg-surface-secondary" />
			)}
			<button
				type="button"
				aria-label="查看录制"
				onClick={() => {
					setShowLightbox(true);
					setLightboxKey((k) => k + 1);
				}}
				className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center border-0 bg-black/0 p-0 transition-colors hover:bg-black/50"
			>
				<span className="flex size-10 items-center justify-center rounded-full bg-black/60">
					<PlayIcon className="size-5 text-white" />
				</span>
			</button>
			<VideoLightbox
				key={lightboxKey}
				src={videoSrc}
				open={showLightbox}
				onClose={() => setShowLightbox(false)}
			/>
		</div>
	);
};
