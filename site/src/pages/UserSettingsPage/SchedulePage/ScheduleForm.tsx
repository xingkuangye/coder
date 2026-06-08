import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { type FormikContextType, useFormik } from "formik";
import { type FC, useEffect, useState } from "react";
import * as Yup from "yup";
import type {
	UpdateUserQuietHoursScheduleRequest,
	UserQuietHoursScheduleResponse,
} from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { Form, FormFields } from "#/components/Form/Form";
import { Spinner } from "#/components/Spinner/Spinner";
import { getFormHelpers } from "#/utils/formUtils";
import { quietHoursDisplay, timeToCron, validTime } from "#/utils/schedule";
import { getPreferredTimezone, timeZones } from "#/utils/timeZones";

interface ScheduleFormValues {
	time: string;
	timezone: string;
}

const validationSchema = Yup.object({
	time: Yup.string()
		.ensure()
		.test("is-time-string", "时间必须为 HH:mm 格式。", (value) => {
			if (!validTime(value)) {
				return false;
			}
			const parts = value.split(":");
			const HH = Number(parts[0]);
			const mm = Number(parts[1]);
			return HH >= 0 && HH <= 23 && mm >= 0 && mm <= 59;
		}),
	timezone: Yup.string().required(),
});

interface ScheduleFormProps {
	isLoading: boolean;
	initialValues: UserQuietHoursScheduleResponse;
	submitError: unknown;
	onSubmit: (data: UpdateUserQuietHoursScheduleRequest) => void;
	// now can be set to force the time used for "Next occurrence" in tests.
	now?: Date;
}

export const ScheduleForm: FC<ScheduleFormProps> = ({
	isLoading,
	initialValues,
	submitError,
	onSubmit,
	now,
}) => {
	// Update every 15 seconds to update the "Next occurrence" field.
	const [, setTime] = useState<number>(Date.now());
	useEffect(() => {
		const interval = setInterval(() => setTime(Date.now()), 15000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	// If the user has a custom schedule, use that as the initial values.
	// Otherwise, use the default time, with their local timezone.
	const formInitialValues = { ...initialValues };
	if (!initialValues.user_set) {
		formInitialValues.timezone = getPreferredTimezone();
	}

	const form: FormikContextType<ScheduleFormValues> =
		useFormik<ScheduleFormValues>({
			initialValues: formInitialValues,
			validationSchema,
			onSubmit: (values) => {
				onSubmit({
					schedule: timeToCron(values.time, values.timezone),
				});
			},
		});
	const getFieldHelpers = getFormHelpers<ScheduleFormValues>(form, submitError);
	const browserLocale = navigator.language || "en-US";

	return (
		<Form onSubmit={form.handleSubmit}>
			<FormFields>
				{Boolean(submitError) && <ErrorAlert error={submitError} />}

				{!initialValues.user_set && (
					<Alert severity="info">
						您当前正在使用默认的安静时间计划，该计划每天在{" "}
						<code>{initialValues.timezone}</code> 的{" "}
						<code>{initialValues.time}</code> 开始。
					</Alert>
				)}

				{!initialValues.user_can_set && (
					<Alert severity="error">
						您的管理员已禁用设置自定义安静时间计划的功能。
					</Alert>
				)}

				<div className="flex flex-row gap-4">
					<TextField
						{...getFieldHelpers("time")}
						disabled={isLoading || !initialValues.user_can_set}
						label="开始时间"
						type="time"
						fullWidth
					/>
					<TextField
						{...getFieldHelpers("timezone")}
						disabled={isLoading || !initialValues.user_can_set}
						label="时区"
						select
						fullWidth
					>
						{timeZones.map((zone) => (
							<MenuItem key={zone} value={zone}>
								{zone}
							</MenuItem>
						))}
					</TextField>
				</div>

				<TextField
					disabled
					fullWidth
					label="下次发生时间"
					value={quietHoursDisplay(
						browserLocale,
						form.values.time,
						form.values.timezone,
						now,
					)}
				/>

				<div>
					<Button
						disabled={isLoading || !initialValues.user_can_set}
						type="submit"
					>
						<Spinner loading={isLoading} />
						更新计划
					</Button>
				</div>
			</FormFields>
		</Form>
	);
};
