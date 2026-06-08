import { isAxiosError } from "axios";
import { type FormikContextType, useFormik } from "formik";
import type { FC, ReactNode } from "react";
import * as Yup from "yup";
import { countries } from "#/api/countriesGenerated";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Checkbox } from "#/components/Checkbox/Checkbox";
import { ExternalImage } from "#/components/ExternalImage/ExternalImage";
import { FormField } from "#/components/FormField/FormField";
import { ProductLogo } from "#/components/Icons/ProductLogo";
import { Label } from "#/components/Label/Label";
import { PasswordField } from "#/components/PasswordField/PasswordField";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import { Spinner } from "#/components/Spinner/Spinner";
import { cn } from "#/utils/cn";
import {
	type FormHelpers,
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "#/utils/formUtils";

const usernameValidator = nameValidator("Username");
const usernameFromEmail = (email: string): string => {
	try {
		const emailPrefix = email.split("@")[0];
		const username = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "-");
		usernameValidator.validateSync(username);
		return username;
	} catch (error) {
		console.warn(
			"failed to automatically generate username, defaulting to 'admin'",
			error,
		);
		return "admin";
	}
};

const validationSchema = Yup.object({
	email: Yup.string()
		.trim()
		.email("请输入有效的电子邮件地址。")
		.required("请输入电子邮件地址。"),
	password: Yup.string().required("请输入密码。"),
	username: usernameValidator,
	trial: Yup.bool(),
	trial_info: Yup.object().when("trial", {
		is: true,
		then: (schema) =>
			schema.shape({
				first_name: Yup.string().required("请输入您的名。"),
				last_name: Yup.string().required("请输入您的姓。"),
				phone_number: Yup.string().required("请输入您的电话号码。"),
				job_title: Yup.string().required("请输入您的职位。"),
				company_name: Yup.string().required("请输入您的公司名称。"),
				country: Yup.string().required("请选择您的国家。"),
				developers: Yup.string().required(
					"请选择贵公司的开发者数量。",
				),
			}),
	}),
	onboarding_info: Yup.object().shape({
		newsletter_marketing: Yup.bool(),
		newsletter_releases: Yup.bool(),
	}),
});

// Keep in sync with cli/login.go (developerBuckets).
const numberOfDevelopersOptions = [
	"1 - 50",
	"51 - 100",
	"101 - 200",
	"201 - 500",
	"501 - 1000",
	"1001 - 2500",
	"2500+",
];

const Field: FC<{
	label: string;
	id: string;
	error?: boolean;
	helperText?: ReactNode;
	className?: string;
	children: ReactNode;
}> = ({ label, id, error, helperText, className, children }) => (
	<div className={cn("flex flex-col gap-2", className)}>
		<Label htmlFor={id}>{label}</Label>
		{children}
		{helperText && (
			<span
				className={cn(
					"text-xs text-left",
					error ? "text-content-destructive" : "text-content-secondary",
				)}
			>
				{helperText}
			</span>
		)}
	</div>
);

type SelectFieldProps = FormHelpers & {
	label: string;
	className?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	children: ReactNode;
};

const SelectField: FC<SelectFieldProps> = ({
	label,
	id,
	error,
	helperText,
	className,
	value,
	onValueChange,
	placeholder,
	children,
}) => (
	<Field
		label={label}
		id={id}
		error={error}
		helperText={helperText}
		className={className}
	>
		<Select value={String(value ?? "")} onValueChange={onValueChange}>
			<SelectTrigger id={id}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>{children}</SelectContent>
		</Select>
	</Field>
);

interface SetupPageViewProps {
	onSubmit: (firstUser: TypesGen.CreateFirstUserRequest) => void;
	error?: unknown;
	isLoading?: boolean;
	authMethods: TypesGen.AuthMethods | undefined;
}

export const SetupPageView: FC<SetupPageViewProps> = ({
	onSubmit,
	error,
	isLoading,
	authMethods,
}) => {
	const form: FormikContextType<TypesGen.CreateFirstUserRequest> =
		useFormik<TypesGen.CreateFirstUserRequest>({
			initialValues: {
				email: "",
				password: "",
				username: "",
				name: "",
				trial: false,
				trial_info: {
					first_name: "",
					last_name: "",
					phone_number: "",
					job_title: "",
					company_name: "",
					country: "",
					developers: "",
				},
				onboarding_info: {
					newsletter_marketing: false,
					newsletter_releases: false,
				},
			},
			validationSchema,
			onSubmit,
			validateOnBlur: false,
			validateOnMount: true,
		});
	const getFieldHelpers = getFormHelpers<TypesGen.CreateFirstUserRequest>(
		form,
		error,
	);

	return (
		<div className="grow basis-0 min-h-screen flex justify-center items-center py-12">
			<div className="flex flex-col w-full max-w-[500px] px-4">
				<header className="mb-8">
					<ProductLogo />
					<h1 className="text-2xl font-normal mt-4 mb-0">
						欢迎使用 <strong>Coder</strong>
					</h1>
					<p className="mt-3 mb-0 text-sm text-content-secondary font-normal">
						设置您的管理员账户，并开始构建安全、可重现的开发环境。
					</p>
				</header>

				<form onSubmit={form.handleSubmit} className="flex flex-col gap-6">
					{authMethods?.github.enabled && (
						<>
							<Button className="w-full" asChild type="submit" size="lg">
								<a href="/api/v2/users/oauth2/github/callback">
									<ExternalImage src="/icon/github.svg?blackWithColor" />
									GitHub
								</a>
							</Button>
							<div className="flex items-center gap-4">
								<div className="h-[1px] w-full bg-border" />
								<div className="shrink-0 text-xs uppercase text-content-secondary tracking-wider">
									或
								</div>
								<div className="h-[1px] w-full bg-border" />
							</div>
						</>
					)}

					{/* Email */}
					<FormField
						label="电子邮件"
						field={getFieldHelpers("email")}
						autoComplete="email"
						onChange={onChangeTrimmed(form, (email) => {
							form.setFieldValue("username", usernameFromEmail(email));
						})}
					/>

					{/* Password */}
					<PasswordField
						field={getFieldHelpers("password")}
						label="密码"
						autoComplete="new-password"
					/>

					{/* Premium trial toggle */}
					<label
						htmlFor="trial"
						className="flex cursor-pointer gap-2 items-start"
					>
						<Checkbox
							id="trial"
							name="trial"
							checked={form.values.trial}
							onCheckedChange={(checked) =>
								form.setFieldValue("trial", checked === true)
							}
							data-testid="trial"
							className="mt-0.5"
						/>
						<div className="flex flex-col items-start gap-0.5">
							<span className="text-sm font-semibold">
								开始 30 天的高级版试用
							</span>
							<span className="text-xs text-content-secondary leading-relaxed">
								获取高可用性、模板 RBAC、审计日志、配额等功能。
							</span>
							<a
								href="https://coder.com/pricing"
								target="_blank"
								rel="noreferrer"
								className="text-xs text-content-link hover:underline mt-0.5"
							>
								了解更多
							</a>
						</div>
					</label>

					{/* Conditional trial info fields */}
					{form.values.trial && (
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-3">
								<FormField
									label="名"
									field={getFieldHelpers("trial_info.first_name")}
								/>
								<FormField
									label="姓"
									field={getFieldHelpers("trial_info.last_name")}
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<FormField
									label="公司"
									field={getFieldHelpers("trial_info.company_name")}
								/>
								<SelectField
									label="开发者数量"
									{...getFieldHelpers("trial_info.developers")}
									onValueChange={(value: string) =>
										form.setFieldValue("trial_info.developers", value)
									}
									placeholder="请选择..."
								>
									{numberOfDevelopersOptions.map((opt) => (
										<SelectItem key={opt} value={opt}>
											{opt}
										</SelectItem>
									))}
								</SelectField>
							</div>
							<FormField
								label="职位"
								field={getFieldHelpers("trial_info.job_title")}
							/>

							<div className="grid grid-cols-2 gap-3">
								<FormField
									label="电话号码"
									field={getFieldHelpers("trial_info.phone_number")}
								/>
								<SelectField
									label="国家"
									{...getFieldHelpers("trial_info.country")}
									onValueChange={(value: string) =>
										form.setFieldValue("trial_info.country", value)
									}
									placeholder="请选择..."
								>
									{countries.map((c) => (
										<SelectItem key={c.name} value={c.name}>
											{c.flag} {c.name}
										</SelectItem>
									))}
								</SelectField>
							</div>
						</div>
					)}

					{/* Sign up for updates */}
					<div className="flex flex-col gap-3">
						<span className="text-sm font-semibold">订阅更新</span>

						<label
							htmlFor="onboarding_info.newsletter_releases"
							className="flex cursor-pointer gap-2 items-start"
						>
							<Checkbox
								id="onboarding_info.newsletter_releases"
								checked={
									form.values.onboarding_info?.newsletter_releases ?? false
								}
								onCheckedChange={(checked) =>
									form.setFieldValue(
										"onboarding_info.newsletter_releases",
										checked === true,
									)
								}
								data-testid="onboarding_info.newsletter_releases"
							/>
							<div className="flex flex-col text-sm">
								<span className="font-medium">发布说明与更新</span>
								<span className="text-content-secondary">
									每月更新日志和安全通知
								</span>
							</div>
						</label>

						<label
							htmlFor="onboarding_info.newsletter_marketing"
							className="flex cursor-pointer gap-2 items-start"
						>
							<Checkbox
								id="onboarding_info.newsletter_marketing"
								checked={
									form.values.onboarding_info?.newsletter_marketing ?? false
								}
								onCheckedChange={(checked) =>
									form.setFieldValue(
										"onboarding_info.newsletter_marketing",
										checked === true,
									)
								}
								data-testid="onboarding_info.newsletter_marketing"
							/>
							<div className="flex flex-col text-sm">
								<span className="font-medium">Coder 月度简报</span>
								<span className="text-content-secondary">
									最新文章、工作坊、活动及公告
								</span>
							</div>
						</label>

						{/* Privacy policy notice */}
						<p className="text-xs text-content-secondary leading-relaxed">
							订阅以获取 Coder 的最新产品和新闻更新。您提供的信息将按照{" "}
							<a
								href="https://coder.com/legal/privacy-policy"
								target="_blank"
								rel="noreferrer"
								className="text-content-link hover:underline"
							>
								Coder 隐私政策
							</a>
							{" "}处理。
						</p>
					</div>

					{/* Error alert */}
					{isAxiosError(error) && error.response?.data?.message && (
						<Alert severity="error" prominent>
							<AlertTitle>{error.response.data.message}</AlertTitle>
							{error.response.data.detail && (
								<AlertDescription>
									{error.response.data.detail}
									<br />
									<a
										target="_blank"
										rel="noreferrer"
										href="https://coder.com/contact/sales"
										className="text-content-link hover:underline"
									>
										联系销售
									</a>
								</AlertDescription>
							)}
						</Alert>
					)}

					<div className="flex justify-end">
						<Button disabled={isLoading} type="submit" data-testid="create">
							<Spinner loading={isLoading} />
							继续
						</Button>
					</div>
				</form>

				<div className="text-xs text-content-secondary pt-6">
					&copy; {new Date().getFullYear()} Coder Technologies, Inc.
				</div>
			</div>
		</div>
	);
};
