import { ExternalLinkIcon, GlobeIcon } from "lucide-react";
import type { FC } from "react";
import { cn } from "#/utils/cn";
import { ToolCollapsible } from "./ToolCollapsible";

interface WebSearchSourcesProps {
	sources: Array<{ url: string; title: string }>;
}

/**
 * 将网络搜索来源渲染为可折叠的工具卡片，保持与其他工具调用渲染一致。
 * 折叠状态下的标题显示地球图标与“已搜索 N 条结果”；展开后显示可点击的标签。
 */
const WebSearchSources: FC<WebSearchSourcesProps> = ({ sources }) => {
	// Deduplicate sources by URL, keeping the first occurrence.
	const unique = (() => {
		const seen = new Set<string>();
		return sources.filter((s) => {
			if (!s.url || seen.has(s.url)) {
				return false;
			}
			seen.add(s.url);
			return true;
		});
	})();

	if (unique.length === 0) {
		return null;
	}

	const detail = unique.length === 1 ? "1 条结果" : `${unique.length} 条结果`;

	return (
		<ToolCollapsible
			hasContent={unique.length > 0}
			header={
				<>
					<GlobeIcon className="size-4 shrink-0 stroke-[1.5] text-current" />
					<span className="text-[13px] leading-6">
						已搜索 <span className="text-content-secondary/60">{detail}</span>
					</span>
				</>
			}
		>
			<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
				{unique.map((source) => (
					<SourcePill key={source.url} source={source} />
				))}
			</div>
		</ToolCollapsible>
	);
};

/**
 * 单个来源引用标签。显示来自 Google S2 服务的网站图标、截断的标题，
 * 以及悬停时出现的外部链接图标。
 */
const SourcePill: FC<{ source: { url: string; title: string } }> = ({
	source,
}) => {
	let hostname: string;
	try {
		hostname = new URL(source.url).hostname;
	} catch {
		hostname = "";
	}

	const faviconUrl = hostname
		? `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`
		: undefined;

	// Use the title if available, otherwise fall back to the hostname.
	const label = source.title || hostname || source.url;

	return (
		<a
			href={source.url}
			target="_blank"
			rel="noopener noreferrer"
			title={source.title || source.url}
			className={cn(
				"group inline-flex items-center gap-1.5 rounded-full",
				"border border-solid border-border-default bg-surface-secondary",
				"px-2.5 py-1 text-xs leading-none text-content-secondary",
				"no-underline transition-colors",
				"hover:bg-surface-tertiary hover:text-content-primary",
				"hover:border-border-secondary",
				"max-w-[200px]",
			)}
		>
			{faviconUrl && (
				<img
					src={faviconUrl}
					alt=""
					width={14}
					height={14}
					className="shrink-0 rounded-sm"
					// Hide the broken-image icon if the favicon fails to load.
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = "none";
					}}
				/>
			)}
			<span className="truncate">{label}</span>
			<ExternalLinkIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
		</a>
	);
};

export default WebSearchSources;
