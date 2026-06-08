import { useFormik } from "formik";
import type { FC } from "react";
import { useMutation } from "react-query";
import { Link as RouterLink, useSearchParams } from "react-router";
import * as Yup from "yup";
import { requestOneTimePassword } from "#/api/queries/users";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { ProductLogo } from "#/components/Icons/ProductLogo";
import { Input } from "#/components/Input/Input";
import { Label } from "#/components/Label/Label";
import { Spinner } from "#/components/Spinner/Spinner";
import { getApplicationName } from "#/utils/appearance";
import { getFormHelpers, onChangeTrimmed } from "#/utils/formUtils";
import { pageTitle } from "#/utils/page";

const RequestOTPPage: FC = () => {
	const applicationName = getApplicationName();
	const requestOTPMutation = useMutation(requestOneTimePassword());
	const [searchParams] = useSearchParams();
	const initialEmail = searchParams.get("email") ?? "";

	return (
		<>
			<title>{pageTitle("重置密码", applicationName)}</title>

			<main className="p-6 flex items-center justify-center flex-col min-h-full text-center">
				<div>
					<ProductLogo />
				</div>
				{requestOTPMutation.isSuccess ? (
					<RequestOTPSuccess
						email={requestOTPMutation.variables?.email ?? ""}
					/>
				) : (
					<RequestOTP
						error={requestOTPMutation.error}
						isRequesting={requestOTPMutation.isPending}
						initialEmail={initialEmail}
						onRequest={(email) => {
							requestOTPMutation.mutate({ email });
						}}
					/>
				)}
			</main>
		</>
	);
};

type RequestOTPProps = {
	error: unknown;
	onRequest: (email: string) => void;
	isRequesting: boolean;
	initialEmail: string;
};

const validationSchema = Yup.object({
	email: Yup.string()
		.trim()
		.email("请输入有效的邮箱地址。")
		.required("请输入邮箱地址。"),
});

const RequestOTP: FC<RequestOTPProps> = ({
	error,
	onRequest,
	isRequesting,
	initialEmail,
}) => {
	const form = useFormik({
		initialValues: { email: initialEmail },
		validationSchema,
		validateOnBlur: false,
		onSubmit: (values) => {
			onRequest(values.email);
		},
	});
	const getFieldHelpers = getFormHelpers(form);
	const emailField = getFieldHelpers("email");

	return (
		<div className="w-full max-w-xs flex flex-col items-center">
			<div>
				<h1 className="m-0 mb-6 text-xl font-semibold leading-7">
					输入您的邮箱以重置密码
				</h1>
				{error ? <ErrorAlert error={error} className="mb-6" /> : null}
				<form
					className="flex flex-col gap-5 w-full"
					onSubmit={form.handleSubmit}
				>
					<fieldset disabled={isRequesting} className="flex flex-col gap-5">
						<div className="flex flex-col items-start gap-2">
							<Label htmlFor={emailField.id}>
								邮箱{" "}
								<span className="text-xs text-content-destructive font-bold">
									*
								</span>
							</Label>
							<Input
								id={emailField.id}
								name={emailField.name}
								value={emailField.value}
								onChange={onChangeTrimmed(form)}
								onBlur={emailField.onBlur}
								type="email"
								autoFocus
								aria-invalid={Boolean(emailField.error)}
							/>
							{emailField.error && (
								<span className="text-xs text-content-destructive text-left">
									{emailField.helperText}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<Button
								disabled={isRequesting}
								type="submit"
								size="lg"
								className="w-full"
							>
								<Spinner loading={isRequesting} />
								重置密码
							</Button>
							<Button asChild size="lg" variant="outline" className="w-full">
								<RouterLink to="/login">取消</RouterLink>
							</Button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	);
};

const RequestOTPSuccess: FC<{ email: string }> = ({ email }) => {
	return (
		<div className="w-full max-w-[380px] flex flex-col items-center font-medium text-sm leading-6">
			<div>
				<p className="m-0 mb-14">
					如果账户{" "}
					<span className="font-semibold text-content-secondary">{email}</span>{" "}
					存在，您将收到一封包含重置密码说明的电子邮件。
				</p>

				<p className="m-0 text-xs leading-4 text-content-secondary mb-12">
					如果遇到问题，请联系您的部署管理员。
				</p>

				<Button asChild variant="default">
					<RouterLink to="/login">返回登录</RouterLink>
				</Button>
			</div>
		</div>
	);
};

export default RequestOTPPage;
