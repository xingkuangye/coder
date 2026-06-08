import { useFormik } from "formik";
import type { FC } from "react";
import { useMutation } from "react-query";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import * as yup from "yup";
import { isApiValidationError } from "#/api/errors";
import { changePasswordWithOTP } from "#/api/queries/users";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { ProductLogo } from "#/components/Icons/ProductLogo";
import { Input } from "#/components/Input/Input";
import { Label } from "#/components/Label/Label";
import { Spinner } from "#/components/Spinner/Spinner";
import { getApplicationName } from "#/utils/appearance";
import { getFormHelpers } from "#/utils/formUtils";
import { pageTitle } from "#/utils/page";

const validationSchema = yup.object({
	password: yup.string().required("密码为必填项"),
	confirmPassword: yup
		.string()
		.required("确认密码为必填项")
		.test("passwords-match", "两次密码输入不一致", function (value) {
			return this.parent.password === value;
		}),
});

type ChangePasswordChangeProps = {
	// This is used to prevent redirection when testing the page in Storybook and
	// capturing Chromatic snapshots.
	redirect?: boolean;
};

const ChangePasswordPage: FC<ChangePasswordChangeProps> = ({ redirect }) => {
	const navigate = useNavigate();
	const applicationName = getApplicationName();
	const changePasswordMutation = useMutation(changePasswordWithOTP());
	const [searchParams] = useSearchParams();

	const form = useFormik({
		initialValues: {
			password: "",
			confirmPassword: "",
		},
		validateOnBlur: false,
		validationSchema,
		onSubmit: async (values) => {
			const email = searchParams.get("email") ?? "";
			const otp = searchParams.get("otp") ?? "";

			await changePasswordMutation.mutateAsync(
				{
					email,
					one_time_passcode: otp,
					password: values.password,
				},
				{
					onSuccess: () => {
						toast.success("密码重置成功。");
						if (redirect) {
							navigate("/login");
						}
					},
				},
			);
		},
	});
	const getFieldHelpers = getFormHelpers(form, changePasswordMutation.error);
	const passwordField = getFieldHelpers("password");
	const confirmPasswordField = getFieldHelpers("confirmPassword");

	return (
		<>
			<title>{pageTitle("重置密码", applicationName)}</title>

			<div className="p-6 flex items-center justify-center flex-col min-h-full text-center">
				<main className="w-full max-w-xs flex flex-col items-center">
					<div className="mb-10">
						<ProductLogo />
					</div>
					<h1 className="m-0 mb-6 text-xl font-semibold leading-7">
						选择新密码
					</h1>
					{changePasswordMutation.error &&
					!isApiValidationError(changePasswordMutation.error) ? (
						<ErrorAlert error={changePasswordMutation.error} className="mb-6" />
					) : null}
					<form
						className="flex flex-col gap-5 w-full"
						onSubmit={form.handleSubmit}
					>
						<fieldset
							disabled={form.isSubmitting}
							className="flex flex-col gap-5"
						>
							<div className="flex flex-col items-start gap-2">
								<Label htmlFor={passwordField.id}>
									密码{" "}
									<span className="text-xs text-content-destructive font-bold">
										*
									</span>
								</Label>
								<Input
									id={passwordField.id}
									name={passwordField.name}
									value={passwordField.value}
									onChange={passwordField.onChange}
									onBlur={passwordField.onBlur}
									autoFocus
									required
									type="password"
									aria-invalid={passwordField.error}
								/>
								{passwordField.error && (
									<span className="text-xs text-content-destructive">
										{passwordField.helperText}
									</span>
								)}
							</div>

							<div className="flex flex-col items-start gap-2">
								<Label htmlFor={confirmPasswordField.id}>
									确认密码{" "}
									<span className="text-xs text-content-destructive font-bold">
										*
									</span>
								</Label>
								<Input
									id={confirmPasswordField.id}
									name={confirmPasswordField.name}
									value={confirmPasswordField.value}
									onChange={confirmPasswordField.onChange}
									onBlur={confirmPasswordField.onBlur}
									required
									type="password"
									aria-invalid={confirmPasswordField.error}
								/>
								{confirmPasswordField.error && (
									<span className="text-xs text-content-destructive text-left">
										{confirmPasswordField.helperText}
									</span>
								)}
							</div>

							<div className="flex flex-col gap-2">
								<Button
									disabled={form.isSubmitting}
									type="submit"
									size="lg"
									className="w-full"
								>
									<Spinner loading={form.isSubmitting} />
									重置密码
								</Button>
								<Button size="lg" className="w-full" variant="subtle" asChild>
									<RouterLink to="/login">返回登录</RouterLink>
								</Button>
							</div>
						</fieldset>
					</form>
				</main>
			</div>
		</>
	);
};

export default ChangePasswordPage;
