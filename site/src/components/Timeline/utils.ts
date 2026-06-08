import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import { formatDate } from "#/utils/time";

dayjs.extend(calendar);

export const createDisplayDate = (
	date: Date,
	base: Date = new Date(),
): string => {
	const lastWeek = dayjs(base).subtract(7, "day").toDate();
	if (date >= lastWeek) {
		return dayjs(date).calendar(dayjs(base), {
			sameDay: "[今天]",
			lastDay: "[昨天]",
			lastWeek: "[上周] dddd",
			sameElse: "MM/DD/YYYY",
		});
	}
	return formatDate(date, {
		hour: undefined,
		minute: undefined,
		second: undefined,
	});
};
