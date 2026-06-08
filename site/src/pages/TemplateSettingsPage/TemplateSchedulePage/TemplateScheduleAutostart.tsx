import FormHelperText from "@mui/material/FormHelperText";
import type { FC } from "react";
import { Button } from "#/components/Button/Button";
import {
	sortedDays,
	type TemplateAutostartRequirementDaysValue,
} from "#/utils/schedule";

interface TemplateScheduleAutostartProps {
	enabled: boolean;
	value: TemplateAutostartRequirementDaysValue[];
	isSubmitting: boolean;
	onChange: (value: TemplateAutostartRequirementDaysValue[]) => void;
}

export const TemplateScheduleAutostart: FC<TemplateScheduleAutostartProps> = ({
	value,
	isSubmitting,
	enabled,
	onChange,
}) => {
	return (
		<div className="flex flex-col gap-2 items-start">
			<div className="flex flex-row items-baseline justify-center w-full gap-0.5">
				{(
					[
						{ value: "monday", key: "周一" },
						{ value: "tuesday", key: "周二" },
						{ value: "wednesday", key: "周三" },
						{ value: "thursday", key: "周四" },
						{ value: "friday", key: "周五" },
						{ value: "saturday", key: "周六" },
						{ value: "sunday", key: "周日" },
					] as {
						value: TemplateAutostartRequirementDaysValue;
						key: string;
					}[]
				).map((day) => (
					<Button
						variant="outline"
						// TODO: Adding a background color would also help
						className={`flex-1 rounded-none ${value.includes(day.value) ? "text-content-primary bg-surface-tertiary" : "text-content-secondary"}`}
						key={day.key}
						disabled={isSubmitting || !enabled}
						onClick={() => {
							if (!value.includes(day.value)) {
								onChange(value.concat(day.value));
							} else {
								onChange(value.filter((obj) => obj !== day.value));
							}
						}}
					>
						{day.key}
					</Button>
				))}
			</div>
			<FormHelperText>
				<AutostartHelperText allowed={enabled} days={value} />
			</FormHelperText>
		</div>
	);
};

interface AutostartHelperTextProps {
	allowed?: boolean;
	days: TemplateAutostartRequirementDaysValue[];
}

const AutostartHelperText: FC<AutostartHelperTextProps> = ({
	allowed,
	days: unsortedDays,
}) => {
	if (!allowed) {
		return <span>工作区不允许自动启动。</span>;
	}

	const days = new Set(unsortedDays);

	if (days.size === 7) {
		// If every day is allowed, no more explaining is needed.
		return <span>工作区允许在任何一天自动启动。</span>;
	}
	if (days.size === 0) {
		return (
			<span>
				工作区永远不会自动启动。这实际上与禁用自动启动相同。
			</span>
		);
	}

	let daymsg = "工作区在周末永远不会自动启动。";
	if (days.size !== 5 || days.has("saturday") || days.has("sunday")) {
		daymsg = `工作区可以在 ${sortedDays
			.filter((day) => days.has(day))
			.join(", ")} 自动启动。`;
	}

	return (
		<span>{daymsg} 这些天相对于用户的时区。</span>
	);
};
