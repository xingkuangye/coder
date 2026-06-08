import { type FormikContextType, useFormik } from "formik";
import type { FC } from "react";
import * as Yup from "yup";
import { Alert } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { Form, FormFields } from "#/components/Form/Form";
import { FormField } from "#/components/FormField/FormField";
import { PasswordField } from "#/components/PasswordField/PasswordField";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Spinner } from "#/components/Spinner/Spinner";
import { getFormHelpers } from "#/utils/formUtils";

interface SecurityFormValues {
	old_password: string;
	password: string;
	confirm_password: string;
}

const validationSchema = Yup.object({
	old_password: Yup.string().trim().required("请输入旧密码"),
	password: Yup.string().trim().required("请输入新密码"),
	confirm_password: Yup.string()
		.trim()
		.test(
			"passwords-match",
			"密码和确认密码必须一致",
			function (value) {
				return (this.parent as SecurityFormValues).password === value;
			},
		),
});

interface SecurityFormProps {
	disabled: boolean;
	isLoading: boolean;
	onSubmit: (values: SecurityFormValues) => void;
	error?: unknown;
}

export const SecurityForm: FC<SecurityFormProps> = ({
	disabled,
	isLoading,
	onSubmit,
	error,
}) => {
	const form: FormikContextType<SecurityFormValues> =
		useFormik<SecurityFormValues>({
			initialValues: {
				old_password: "",
				password: "",
				confirm_password: "",
			},
			validationSchema,
			onSubmit,
		});
	const getFieldHelpers = getFormHelpers<SecurityFormValues>(form, error);

	if (disabled) {
		return (
			<Alert severity="info">
				只有基于密码的账户才允许更改密码。
			</Alert>
		);
	}

	return (
		<>
			<SettingsHeader>
				<SettingsHeaderTitle hierarchy="secondary">
					密码
				</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					更新您的账户密码。
				</SettingsHeaderDescription>
			</SettingsHeader>
			<Form onSubmit={form.handleSubmit}>
				<FormFields>
					{Boolean(error) && <ErrorAlert error={error} />}
					<FormField
						field={getFieldHelpers("old_password")}
						label="旧密码"
						type="password"
						autoComplete="current-password"
					/>
					<PasswordField
						field={getFieldHelpers("password")}
						label="新密码"
						autoComplete="new-password"
					/>
					<FormField
						field={getFieldHelpers("confirm_password")}
						label="确认密码"
						type="password"
						autoComplete="new-password"
					/>

					<div>
						<Button disabled={isLoading} type="submit">
							<Spinner loading={isLoading} />
							更新密码
						</Button>
					</div>
				</FormFields>
			</Form>
		</>
	);
};
