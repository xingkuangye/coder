import type { FC } from "react";
import type { Template } from "#/api/typesGenerated";
import type { TemplateAutostopRequirementDaysValue } from "#/utils/schedule";

const autostopRequirementDescriptions = {
	off: "工作区不需要定期停止。",
	daily:
		"工作区需要在用户的安静时段和时区内每天自动停止。",
	saturday:
		"工作区需要在用户的安静时段和时区内每周六自动停止。",
	sunday:
		"工作区需要在用户的安静时段和时区内每周日自动停止。",
};

export const convertAutostopRequirementDaysValue = (
	days: Template["autostop_requirement"]["days_of_week"],
): TemplateAutostopRequirementDaysValue => {
	if (days.length === 7) {
		return "daily";
	}

	if (days.length === 1 && days[0] === "saturday") {
		return "saturday";
	}

	if (days.length === 1 && days[0] === "sunday") {
		return "sunday";
	}

	// On unsupported values we default to "off".
	return "off";
};

interface AutostopRequirementDaysHelperTextProps {
	days: TemplateAutostopRequirementDaysValue;
}

export const AutostopRequirementDaysHelperText: FC<
	AutostopRequirementDaysHelperTextProps
> = ({ days = "off" }) => {
	return <span>{autostopRequirementDescriptions[days]}</span>;
};

interface AutostopRequirementWeeksHelperTextProps {
	days: TemplateAutostopRequirementDaysValue;
	weeks: number;
}

export const AutostopRequirementWeeksHelperText: FC<
	AutostopRequirementWeeksHelperTextProps
> = ({ days, weeks }) => {
	// Disabled
	if (days !== "saturday" && days !== "sunday") {
		return (
			<span>
				除非强制停止间隔天数设置为周六或周日，否则无法设置停止间隔周数。
			</span>
		);
	}

	if (weeks <= 1) {
		return (
			<span>
				工作区需要在用户的安静时段和时区内，在指定日期的每周自动停止。
			</span>
		);
	}

	return (
		<span>
			工作区需要在用户的安静时段和时区内，在指定日期的每 {weeks} 周自动停止。
		</span>
	);
};
