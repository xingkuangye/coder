/**
 * 基于时间的分组工具，侧边栏用于将聊天归类为“今天”、“昨天”、“本周”和“更早”。
 */
export const TIME_GROUPS = [
	"今天",
	"昨天",
	"本周",
	"更早",
] as const;
type TimeGroup = (typeof TIME_GROUPS)[number];

export function getTimeGroup(dateStr: string): TimeGroup {
	const now = new Date();
	const date = new Date(dateStr);
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const weekAgo = new Date(today);
	weekAgo.setDate(weekAgo.getDate() - 7);

	if (date >= today) return "今天";
	if (date >= yesterday) return "昨天";
	if (date >= weekAgo) return "本周";
	return "更早";
}
