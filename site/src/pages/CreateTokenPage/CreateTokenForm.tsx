import { css } from "@emotion/css";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { FormikContextType } from "formik";
import { type FC, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "#/components/Button/Button";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "#/components/Form/Form";
import { Spinner } from "#/components/Spinner/Spinner";
import { getFormHelpers, onChangeTrimmed } from "#/utils/formUtils";
import {
	type CreateTokenData,
	customLifetimeDay,
	determineDefaultLtValue,
	filterByMaxTokenLifetime,
	NANO_HOUR,
} from "./utils";

dayjs.extend(utc);

interface CreateTokenFormProps {
	form: FormikContextType<CreateTokenData>;
	maxTokenLifetime?: number;
	formError: unknown;
	setFormError: (arg0: unknown) => void;
	isCreating: boolean;
	creationFailed: boolean;
	now?: Date;
}

export const CreateTokenForm: FC<CreateTokenFormProps> = ({
	form,
	maxTokenLifetime,
	formError,
	setFormError,
	isCreating,
	creationFailed,
	now,
}) => {
	const navigate = useNavigate();

	const [expDays, setExpDays] = useState<number>(1);
	const [lifetimeDays, setLifetimeDays] = useState<number | string>(
		determineDefaultLtValue(maxTokenLifetime),
	);
	const currentTime = dayjs(now ?? new Date());

	// biome-ignore lint/correctness/useExhaustiveDependencies: adding form will cause an infinite loop
	useEffect(() => {
		if (lifetimeDays !== "custom") {
			void form.setFieldValue("lifetime", lifetimeDays);
		} else {
			void form.setFieldValue("lifetime", expDays);
		}
	}, [lifetimeDays, expDays]);

	const getFieldHelpers = getFormHelpers<CreateTokenData>(form, formError);

	return (
		<HorizontalForm onSubmit={form.handleSubmit}>
			<FormSection
				title="名称"
				description="该令牌的用途是什么？"
				classes={{ sectionInfo: classNames.sectionInfo }}
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("name")}
						label="名称"
						required
						onChange={onChangeTrimmed(form, () => setFormError(undefined))}
						autoFocus
						fullWidth
					/>
				</FormFields>
			</FormSection>
			<FormSection
				title="过期"
				description={
					form.values.lifetime ? (
						<>
							令牌将于{" "}
							<span data-chromatic="ignore">
								{currentTime
									.add(form.values.lifetime, "days")
									.utc()
									.format("MMMM DD, YYYY")}
							</span>{" "}
							失效
						</>
					) : (
						"请设置令牌过期时间。"
					)
				}
				classes={{ sectionInfo: classNames.sectionInfo }}
			>
				<FormFields>
					<div className="flex flex-row gap-4">
						<TextField
							select
							label="有效期"
							required
							defaultValue={determineDefaultLtValue(maxTokenLifetime)}
							onChange={(event) => {
								void setLifetimeDays(event.target.value);
							}}
							fullWidth
						>
							{filterByMaxTokenLifetime(maxTokenLifetime).map((lt) => (
								<MenuItem key={lt.label} value={lt.value}>
									{lt.label}
								</MenuItem>
							))}
							<MenuItem
								key={customLifetimeDay.label}
								value={customLifetimeDay.value}
							>
								{customLifetimeDay.label}
							</MenuItem>
						</TextField>

						{lifetimeDays === "custom" && (
							<TextField
								type="date"
								label="失效日期"
								defaultValue={dayjs().add(expDays, "day").format("YYYY-MM-DD")}
								onChange={(event) => {
									const lt = Math.ceil(
										dayjs(event.target.value).diff(dayjs(), "day", true),
									);
									setExpDays(lt);
								}}
								inputProps={{
									"data-chromatic": "ignore",
									min: dayjs().add(1, "day").format("YYYY-MM-DD"),
									max: maxTokenLifetime
										? dayjs()
												.add(maxTokenLifetime / NANO_HOUR / 24, "day")
												.format("YYYY-MM-DD")
										: undefined,
									required: true,
								}}
								fullWidth
								InputLabelProps={{
									required: true,
								}}
							/>
						)}
					</div>
				</FormFields>
			</FormSection>

			<FormFooter>
				<Button onClick={() => navigate("/settings/tokens")} variant="outline">
					取消
				</Button>
				<Button type="submit" disabled={isCreating}>
					<Spinner loading={isCreating} />
					{creationFailed ? "重试" : "创建令牌"}
				</Button>
			</FormFooter>
		</HorizontalForm>
	);
};

const classNames = {
	sectionInfo: css`
		min-width: 300px;
	`,
};
