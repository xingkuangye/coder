import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { type FormikTouched, useFormik } from "formik";
import type { FC } from "react";
import * as Yup from "yup";
import {
	CORSBehaviors,
	type Template,
	type UpdateTemplateMeta,
	WorkspaceAppSharingLevels,
} from "#/api/typesGenerated";
import { PremiumBadge } from "#/components/Badges/Badges";
import { Button } from "#/components/Button/Button";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "#/components/Form/Form";
import { IconField } from "#/components/IconField/IconField";
import { Link } from "#/components/Link/Link";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	StackLabel,
	StackLabelHelperText,
} from "#/components/StackLabel/StackLabel";
import { docs } from "#/utils/docs";
import {
	displayNameValidator,
	getFormHelpers,
	iconValidator,
	nameValidator,
	onChangeTrimmed,
} from "#/utils/formUtils";

const MAX_DESCRIPTION_CHAR_LIMIT = 128;
const MAX_DESCRIPTION_MESSAGE = `请输入不超过 ${MAX_DESCRIPTION_CHAR_LIMIT} 个字符的描述。`;

export const validationSchema = Yup.object({
	name: nameValidator("名称"),
	display_name: displayNameValidator("显示名称"),
	description: Yup.string().max(
		MAX_DESCRIPTION_CHAR_LIMIT,
		MAX_DESCRIPTION_MESSAGE,
	),
	allow_user_cancel_workspace_jobs: Yup.boolean(),
	icon: iconValidator,
	require_active_version: Yup.boolean(),
	use_classic_parameter_flow: Yup.boolean(),
	disable_module_cache: Yup.boolean(),
	deprecation_message: Yup.string(),
	max_port_sharing_level: Yup.string().oneOf(WorkspaceAppSharingLevels),
	cors_behavior: Yup.string().oneOf(Object.values(CORSBehaviors)),
});

export interface TemplateSettingsForm {
	template: Template;
	onSubmit: (data: UpdateTemplateMeta) => void;
	onCancel: () => void;
	isSubmitting: boolean;
	error?: unknown;
	// Helpful to show field errors on Storybook
	initialTouched?: FormikTouched<UpdateTemplateMeta>;
	accessControlEnabled: boolean;
	advancedSchedulingEnabled: boolean;
	portSharingControlsEnabled: boolean;
}

export const TemplateSettingsForm: FC<TemplateSettingsForm> = ({
	template,
	onSubmit,
	onCancel,
	error,
	isSubmitting,
	initialTouched,
	accessControlEnabled,
	advancedSchedulingEnabled,
	portSharingControlsEnabled,
}) => {
	const form = useFormik<UpdateTemplateMeta>({
		initialValues: {
			name: template.name,
			display_name: template.display_name,
			description: template.description,
			icon: template.icon,
			allow_user_cancel_workspace_jobs:
				template.allow_user_cancel_workspace_jobs,
			update_workspace_last_used_at: false,
			update_workspace_dormant_at: false,
			require_active_version: template.require_active_version,
			deprecation_message: template.deprecation_message,
			disable_everyone_group_access: false,
			max_port_share_level: template.max_port_share_level,
			use_classic_parameter_flow: template.use_classic_parameter_flow,
			cors_behavior: template.cors_behavior,
			disable_module_cache: template.disable_module_cache,
		},
		validationSchema,
		onSubmit,
		initialTouched,
	});
	const getFieldHelpers = getFormHelpers(form, error);

	return (
		<HorizontalForm
			onSubmit={form.handleSubmit}
			aria-label="模板设置表单"
		>
			<FormSection
				title="基本信息"
				description="名称用于在 URL 和 API 中标识模板。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("name")}
						disabled={isSubmitting}
						onChange={onChangeTrimmed(form)}
						autoFocus
						fullWidth
						label="名称"
					/>
				</FormFields>
			</FormSection>

			<FormSection
				title="显示信息"
				description="友好的名称、描述和图标，帮助开发者识别您的模板。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("display_name")}
						disabled={isSubmitting}
						fullWidth
						label="显示名称"
					/>

					<TextField
						{...getFieldHelpers("description", {
							maxLength: MAX_DESCRIPTION_CHAR_LIMIT,
						})}
						multiline
						disabled={isSubmitting}
						fullWidth
						label="描述"
						rows={2}
					/>

					<IconField
						{...getFieldHelpers("icon")}
						disabled={isSubmitting}
						onChange={onChangeTrimmed(form)}
						fullWidth
						label="图标"
						onPickEmoji={(value) => form.setFieldValue("icon", value)}
					/>
				</FormFields>
			</FormSection>

			<FormSection
				title="操作"
				description="管理从此模板创建的工作区可执行的操作。"
			>
				<FormFields className="gap-12">
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								id="allow_user_cancel_workspace_jobs"
								name="allow_user_cancel_workspace_jobs"
								disabled={isSubmitting}
								checked={form.values.allow_user_cancel_workspace_jobs}
								onChange={form.handleChange}
							/>
						}
						label={
							<StackLabel>
								允许用户取消进行中的工作区任务。
								<StackLabelHelperText>
									根据您的模板，取消构建可能导致工作区处于不健康状态。不推荐大多数用例使用此选项。{" "}
									<strong>
										如果勾选，用户可能会损坏其工作区。
									</strong>
								</StackLabelHelperText>
							</StackLabel>
						}
					/>

					<FormControlLabel
						control={
							<Checkbox
								size="small"
								id="require_active_version"
								name="require_active_version"
								checked={form.values.require_active_version}
								onChange={form.handleChange}
								disabled={
									!template.require_active_version && !advancedSchedulingEnabled
								}
							/>
						}
						label={
							<StackLabel>
								要求工作区启动时自动更新。
								<StackLabelHelperText>
									<span>
										手动启动或自动启动的工作区将使用活动模板版本。{" "}
										<strong>
											此设置对模板管理员不强制执行。
										</strong>
									</span>

									{!advancedSchedulingEnabled && (
										<div className="flex flex-row gap-4 items-center mt-4">
											<PremiumBadge />
											<span>需要高级许可证才能启用。</span>
										</div>
									)}
								</StackLabelHelperText>
							</StackLabel>
						}
					/>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								id="use_classic_parameter_flow"
								name="use_classic_parameter_flow"
								checked={!form.values.use_classic_parameter_flow}
								onChange={(event) =>
									form.setFieldValue(
										"use_classic_parameter_flow",
										!event.currentTarget.checked,
									)
								}
								disabled={false}
							/>
						}
						label={
							<StackLabel>
								<span className="flex flex-row gap-2">
									为工作区创建启用动态参数（推荐）
								</span>
								<StackLabelHelperText>
									<div>
										动态工作区表单允许您使用其他表单类型和身份感知条件参数来设计模板。这是新模板的默认选项。经典工作区创建流程将在未来版本中弃用。
									</div>
									<Link
										className="text-xs"
										href={docs(
											"/admin/templates/extending-templates/dynamic-parameters",
										)}
									>
										了解更多
									</Link>
								</StackLabelHelperText>
							</StackLabel>
						}
					/>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								id="disable_module_cache"
								name="disable_module_cache"
								checked={form.values.disable_module_cache}
								onChange={form.handleChange}
								disabled={isSubmitting}
							/>
						}
						label={
							<StackLabel>
								禁用 Terraform 模块缓存
								<StackLabelHelperText>
									勾选后，每次工作区构建都会重新下载 Terraform 模块，而非使用缓存版本。{" "}
									<strong>
										警告：这会使工作区构建变得不可预测，不推荐用于生产模板。
									</strong>
								</StackLabelHelperText>
							</StackLabel>
						}
					/>
				</FormFields>
			</FormSection>

			<FormSection
				title="弃用"
				description="弃用模板会阻止创建任何新工作区。现有工作区将继续运行。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("deprecation_message", {
							helperText:
								"留空消息以保持模板处于活动状态。提供任何消息都会将模板标记为已弃用。使用此消息通知用户弃用信息以及如何迁移到新模板。",
						})}
						disabled={
							isSubmitting || (!template.deprecated && !accessControlEnabled)
						}
						fullWidth
						label="弃用消息"
					/>
					{!accessControlEnabled && (
						<div className="flex flex-row gap-4 items-center">
							<PremiumBadge />
							<FormHelperText>
								需要高级许可证才能弃用模板。
								{template.deprecated &&
									" 您无法更改消息，但可以将其删除以将此模板标记为不再弃用。"}
							</FormHelperText>
						</div>
					)}
				</FormFields>
			</FormSection>

			<FormSection
				title="端口共享"
				description="具有 Public 共享级别的共享端口任何人都可以访问，而具有 Authenticated 共享级别的端口只能由经过身份验证的 Coder 用户访问。具有 Owner 共享级别的端口只能由工作区所有者访问。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("max_port_share_level", {
							helperText:
								"允许工作区使用的最大端口共享级别。",
						})}
						disabled={isSubmitting || !portSharingControlsEnabled}
						fullWidth
						select
						value={
							portSharingControlsEnabled
								? form.values.max_port_share_level
								: "public"
						}
						label="最大端口共享级别"
					>
						<MenuItem value="owner">所有者</MenuItem>
						<MenuItem value="organization">组织</MenuItem>
						<MenuItem value="authenticated">已认证</MenuItem>
						<MenuItem value="public">公共</MenuItem>
					</TextField>
					{!portSharingControlsEnabled && (
						<div className="flex flex-row gap-4 items-center">
							<PremiumBadge />
							<FormHelperText>
								需要高级许可证才能控制最大端口共享级别。
							</FormHelperText>
						</div>
					)}
				</FormFields>
			</FormSection>

			<FormSection
				title="CORS 行为"
				description="控制如何处理所有共享端口的跨域资源共享 (CORS) 请求。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("cors_behavior", {
							helperText:
								"使用 Passthru 绕过 Coder 内置的 CORS 保护。",
						})}
						disabled={isSubmitting}
						fullWidth
						select
						value={form.values.cors_behavior}
						label="CORS 行为"
					>
						<MenuItem value="simple">简单（推荐）</MenuItem>
						<MenuItem value="passthru">直通</MenuItem>
					</TextField>
				</FormFields>
			</FormSection>

			<FormFooter>
				<Button onClick={onCancel} variant="outline">
					取消
				</Button>

				<Button type="submit" disabled={isSubmitting}>
					<Spinner loading={isSubmitting} />
					保存
				</Button>
			</FormFooter>
		</HorizontalForm>
	);
};
