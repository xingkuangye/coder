import type { FC } from "react";

/**
 * 采用彩色背景的药丸形差异统计徽章，用于 Git 选项卡标题中。
 */
export const DiffStatBadge: FC<{ additions: number; deletions: number }> = ({
	additions,
	deletions,
}) => {
	if (additions === 0 && deletions === 0) {
		return null;
	}
	return (
		<span className="inline-flex items-center overflow-hidden rounded-sm border border-solid border-border-default font-mono text-[13px] font-medium leading-5">
			{additions > 0 && (
				<span className="flex items-center px-1.5 bg-surface-git-added text-git-added-bright">
					+{additions}
				</span>
			)}
			{deletions > 0 && (
				<span className="flex items-center px-1.5 bg-surface-git-deleted text-git-deleted-bright">
					&minus;{deletions}
				</span>
			)}
		</span>
	);
};
