import type { FC } from "react";
import { Link } from "react-router";
import type { Template, TemplateVersion } from "#/api/typesGenerated";
import { Stats, StatsItem } from "#/components/Stats/Stats";
import { createDayString } from "#/utils/createDayString";
import {
	formatTemplateActiveDevelopers,
	formatTemplateBuildTime,
} from "#/utils/templates";

interface TemplateStatsProps {
	template: Template;
	activeVersion: TemplateVersion;
}

export const TemplateStats: FC<TemplateStatsProps> = ({
	template,
	activeVersion,
}) => {
	return (
		<Stats>
			<StatsItem
				label="使用者"
				value={
					<>
						{formatTemplateActiveDevelopers(template.active_user_count)}{" "}
						{template.active_user_count === 1 ? "开发者" : "开发者"}
					</>
				}
			/>
			<StatsItem
				label="构建时间"
				value={formatTemplateBuildTime(template.build_time_stats.start.P50)}
			/>
			<StatsItem
				label="活跃版本"
				value={
					<Link to={`versions/${activeVersion.name}`}>
						{activeVersion.name}
					</Link>
				}
			/>
			<StatsItem
				label="最后更新"
				value={createDayString(template.updated_at)}
			/>
			<StatsItem label="创建者" value={template.created_by_name} />
		</Stats>
	);
};
