import type { FC } from "react";
import { useNavigate } from "react-router";
import type { TemplateVersion } from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import { Button } from "#/components/Button/Button";
import { InfoTooltip } from "#/components/InfoTooltip/InfoTooltip";
import { Pill } from "#/components/Pill/Pill";
import { TableCell } from "#/components/Table/Table";
import { TimelineEntry } from "#/components/Timeline/TimelineEntry";
import { useClickableTableRow } from "#/hooks/useClickableTableRow";

interface VersionRowProps {
	version: TemplateVersion;
	isActive: boolean;
	isLatest: boolean;
	onPromoteClick?: (templateVersionId: string) => void;
	onArchiveClick?: (templateVersionId: string) => void;
}

export const VersionRow: FC<VersionRowProps> = ({
	version,
	isActive,
	isLatest,
	onPromoteClick,
	onArchiveClick,
}) => {
	const navigate = useNavigate();

	const clickableProps = useClickableTableRow({
		onClick: () => navigate(version.name),
	});

	const jobStatus = version.job.status;

	return (
		<TimelineEntry data-testid={`version-${version.id}`} {...clickableProps}>
			<TableCell className="relative border-b-0 !p-0">
				<div className="flex flex-row items-center justify-between gap-4 px-8 py-4">
					<div className="flex flex-row items-center gap-4">
						<Avatar
							fallback={version.created_by.username}
							src={version.created_by.avatar_url}
						/>
						<div className="flex flex-row items-center gap-2 font-inherit text-base font-normal leading-normal">
							<span>
								<strong>{version.created_by.username}</strong> 创建了版本{" "}
								<strong>{version.name}</strong>
							</span>
							{version.message && (
								<InfoTooltip title="消息" message={version.message} />
							)}
							<span className="text-xs text-content-secondary">
								{new Date(version.created_at).toLocaleTimeString()}
							</span>
						</div>
					</div>
					<div className="flex flex-row items-center gap-4">
						{isActive && (
							<Pill role="status" type="success">
								活跃
							</Pill>
						)}
						{isLatest && (
							<Pill role="status" type="info">
								最新
							</Pill>
						)}
						{jobStatus === "pending" && (
							<Pill role="status" type="inactive">
								待处理&hellip;
							</Pill>
						)}
						{jobStatus === "running" && (
							<Pill role="status" type="active">
								构建中&hellip;
							</Pill>
						)}
						{(jobStatus === "canceling" || jobStatus === "canceled") && (
							<Pill role="status" type="inactive">
								已取消
							</Pill>
						)}
						{jobStatus === "failed" && (
							<Pill role="status" type="error">
								失败
							</Pill>
						)}

						{jobStatus === "failed" && onArchiveClick && (
							<Button
								variant="outline"
								disabled={isActive || version.archived}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onArchiveClick?.(version.id);
								}}
							>
								归档&hellip;
							</Button>
						)}

						{jobStatus === "succeeded" && onPromoteClick && (
							<Button
								variant="outline"
								disabled={isActive || jobStatus !== "succeeded"}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onPromoteClick?.(version.id);
								}}
							>
								提升&hellip;
							</Button>
						)}
					</div>
				</div>
			</TableCell>
		</TimelineEntry>
	);
};
