import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * 返回描述时间流逝的人类可读字符串
 * 为便于测试而拆分为独立模块
 */
export function createDayString(time: string): string {
	return dayjs().to(dayjs(time));
}
