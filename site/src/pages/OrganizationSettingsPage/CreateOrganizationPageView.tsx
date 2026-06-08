import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { ArrowLeftIcon } from "lucide-react";
import type { FC } from "react";
import { Link, useNavigate } from "react-router";
import * as Yup from "yup";
import { isApiValidationError } from "#/api/errors";
import type { CreateOrganizationRequest } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Badges, PremiumBadge } from "#/components/Badges/Badges";
import { Button } from "#/components/Button/Button";
import { IconField } from "#/components/IconField/IconField";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import { PopoverPaywall } from "#/components/Paywall/PopoverPaywall";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { docs } from "#/utils/docs";
import {
	displayNameValidator,
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "#/utils/formUtils";

const MAX_DESCRIPTION_CHAR_LIMIT = 128;
const MAX_DESCRIPTION_MESSAGE = `描述不能超过 ${MAX_DESCRIPTION_CHAR_LIMIT} 个字符。`;

const validationSchema = Yup.object({
	name: nameValidator("名称"),
	display_name: displayNameValidator("显示名称"),
	description: Yup.string().max(
		MAX_DESCRIPTION_CHAR_LIMIT,
		MAX_DESCRIPTION_MESSAGE,
	),
});

interface CreateOrganizationPageViewProps {
	error: unknown;
	onSubmit: (values: CreateOrganizationRequest) => Promise<void>;
	isEntitled: boolean;
}

export const CreateOrganizationPageView: FC<
	CreateOrganizationPageViewProps
> = ({ error, onSubmit, isEntitled }) => {
	const form = useFormik<CreateOrganizationRequest>({
		initialValues: {
			name: "",
			display_name: "",
			description: "",
			icon: "",
		},
		validationSchema,
		onSubmit,
	});
	const navigate = useNavigate();
	const getFieldHelpers = getFormHelpers(form, error);

	return (
		<div className="flex flex-row font-medium">
			<div className="absolute left-12">
				<Link
					to="/organizations"
					className="flex flex-row items-center gap-2 no-underline text-content-secondary hover:text-content-primary"
				>
					<ArrowLeftIcon size={20} />
					返回
				</Link>
			</div>
			<div className="flex flex-col gap-4 w-full min-w-96 mx-auto">
				<div className="flex flex-col items-center">
					{Boolean(error) && !isApiValidationError(error) && (
						<div className="mb-8">
							<ErrorAlert error={error} />
						</div>
					)}

					<Badges>
						<Tooltip>
							{isEntitled && (
								<TooltipTrigger asChild>
									<span>
										<PremiumBadge />
									</span>
								</TooltipTrigger>
							)}

							<TooltipContent
								sideOffset={-28}
								collisionPadding={16}
								className="p-0"
							>
								<PopoverPaywall
									message="组织"
									description="在单个 Coder 部署中创建多个组织，允许多个平台团队使用隔离的用户、模板和独立的基础设施进行操作。"
									documentationLink={docs("/admin/users/organizations")}
								/>
							</TooltipContent>
						</Tooltip>
					</Badges>

					<header className="flex flex-col items-center">
						<h1 className="text-3xl font-semibold m-0">新建组织</h1>
						<p className="max-w-md text-sm text-content-secondary text-center">
							将你的部署组织为多个平台团队，每个团队拥有独立的 provisioner、模板、群组和成员。
						</p>
					</header>
				</div>
				{!isEntitled ? (
					<div className="min-w-fit mx-auto">
						<PaywallPremium
							message="组织"
							description="在单个 Coder 部署中创建多个组织，允许多个平台团队使用隔离的用户、模板和独立的基础设施进行操作。"
							documentationLink={docs("/admin/users/organizations")}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-4 w-full max-w-xl min-w-72 mx-auto">
						<form
							onSubmit={form.handleSubmit}
							aria-label="组织设置表单"
							className="flex flex-col gap-6 w-full"
						>
							<fieldset
								disabled={form.isSubmitting}
								className="flex flex-col gap-6 w-full border-none"
							>
								<TextField
									{...getFieldHelpers("name")}
									onChange={onChangeTrimmed(form)}
									fullWidth
									label="标识"
								/>
								<TextField
									{...getFieldHelpers("display_name")}
									fullWidth
									label="显示名称"
								/>
								<TextField
									{...getFieldHelpers("description")}
									multiline
									label="描述"
									rows={2}
								/>
								<IconField
									{...getFieldHelpers("icon")}
									onChange={onChangeTrimmed(form)}
									onPickEmoji={(value) => form.setFieldValue("icon", value)}
								/>
							</fieldset>
							<div className="flex flex-row gap-2">
								<Button type="submit" disabled={form.isSubmitting}>
									{form.isSubmitting && <Spinner />}
									保存
								</Button>
								<Button
									variant="outline"
									type="button"
									onClick={() => navigate("/organizations")}
								>
									取消
								</Button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};
