import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { type FormikTouched, useFormik } from "formik";
import { type FC, useEffect, useState } from "react";
import type { Template, UpdateTemplateMeta } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Checkbox } from "#/components/Checkbox/Checkbox";
import { DurationField } from "#/components/DurationField/DurationField";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "#/components/Form/Form";
import { Label } from "#/components/Label/Label";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	StackLabel,
	StackLabelHelperText,
} from "#/components/StackLabel/StackLabel";
import { Switch } from "#/components/Switch/Switch";
import { getFormHelpers } from "#/utils/formUtils";
import {
	calculateAutostopRequirementDaysValue,
	type TemplateAutostartRequirementDaysValue,
} from "#/utils/schedule";
import {
	AutostopRequirementDaysHelperText,
	AutostopRequirementWeeksHelperText,
	convertAutostopRequirementDaysValue,
} from "./AutostopRequirementHelperText";
import {
	getValidationSchema,
	type TemplateScheduleFormValues,
} from "./formHelpers";
import { ScheduleDialog } from "./ScheduleDialog";
import { TemplateScheduleAutostart } from "./TemplateScheduleAutostart";
import {
	ActivityBumpHelperText,
	DefaultTTLHelperText,
	DormancyAutoDeletionTTLHelperText,
	DormancyTTLHelperText,
	FailureTTLHelperText,
} from "./TTLHelperText";
import {
	useWorkspacesToBeDeleted,
	useWorkspacesToGoDormant,
} from "./useWorkspacesToBeDeleted";

const MS_HOUR_CONVERSION = 3600000;
const MS_DAY_CONVERSION = 86400000;
const FAILURE_CLEANUP_DEFAULT = 7 * MS_DAY_CONVERSION;
const INACTIVITY_CLEANUP_DEFAULT = 180 * MS_DAY_CONVERSION;
const DORMANT_AUTODELETION_DEFAULT = 30 * MS_DAY_CONVERSION;
/**
 * The default form field space is 4 but since this form is quite heavy I think
 * increase the space can make it feels lighter.
 */
const FORM_FIELDS_GAP = "gap-16";

export interface TemplateScheduleForm {
	template: Template;
	onSubmit: (data: UpdateTemplateMeta) => void;
	onCancel: () => void;
	isSubmitting: boolean;
	error?: unknown;
	allowAdvancedScheduling: boolean;
	// Helpful to show field errors on Storybook
	initialTouched?: FormikTouched<UpdateTemplateMeta>;
}

export const TemplateScheduleForm: FC<TemplateScheduleForm> = ({
	template,
	onSubmit,
	onCancel,
	error,
	allowAdvancedScheduling,
	isSubmitting,
	initialTouched,
}) => {
	const validationSchema = getValidationSchema();
	const form = useFormik<TemplateScheduleFormValues>({
		initialValues: {
			// on display, convert from ms => hours
			default_ttl_ms: template.default_ttl_ms / MS_HOUR_CONVERSION,
			activity_bump_ms: template.activity_bump_ms / MS_HOUR_CONVERSION,
			failure_ttl_ms: template.failure_ttl_ms,
			time_til_dormant_ms: template.time_til_dormant_ms,
			time_til_dormant_autodelete_ms: template.time_til_dormant_autodelete_ms,
			autostop_requirement_days_of_week: allowAdvancedScheduling
				? convertAutostopRequirementDaysValue(
						template.autostop_requirement.days_of_week,
					)
				: "off",
			autostop_requirement_weeks: allowAdvancedScheduling
				? template.autostop_requirement.weeks > 0
					? template.autostop_requirement.weeks
					: 1
				: 1,
			autostart_requirement_days_of_week: template.autostart_requirement
				.days_of_week as TemplateAutostartRequirementDaysValue[],

			allow_user_autostart: template.allow_user_autostart,
			allow_user_autostop: template.allow_user_autostop,
			failure_cleanup_enabled:
				allowAdvancedScheduling && Boolean(template.failure_ttl_ms),
			inactivity_cleanup_enabled:
				allowAdvancedScheduling && Boolean(template.time_til_dormant_ms),
			dormant_autodeletion_cleanup_enabled:
				allowAdvancedScheduling &&
				Boolean(template.time_til_dormant_autodelete_ms),
			update_workspace_last_used_at: false,
			update_workspace_dormant_at: false,
			require_active_version: false,
			disable_everyone_group_access: false,
		},
		validationSchema,
		onSubmit: () => {
			const dormancyChanged =
				form.initialValues.time_til_dormant_ms !==
				form.values.time_til_dormant_ms;
			const deletionChanged =
				form.initialValues.time_til_dormant_autodelete_ms !==
				form.values.time_til_dormant_autodelete_ms;

			const dormancyScheduleChanged =
				form.values.inactivity_cleanup_enabled &&
				dormancyChanged &&
				workspacesToDormancyInWeek &&
				workspacesToDormancyInWeek.length > 0;

			const deletionScheduleChanged =
				form.values.inactivity_cleanup_enabled &&
				deletionChanged &&
				workspacesToBeDeletedInWeek &&
				workspacesToBeDeletedInWeek.length > 0;

			if (dormancyScheduleChanged || deletionScheduleChanged) {
				setIsScheduleDialogOpen(true);
			} else {
				submitValues();
			}
		},
		initialTouched,
		enableReinitialize: true,
	});

	const getFieldHelpers = getFormHelpers<TemplateScheduleFormValues>(
		form,
		error,
	);

	const now = new Date();
	const weekFromNow = new Date(now);
	weekFromNow.setDate(now.getDate() + 7);

	const workspacesToDormancyNow = useWorkspacesToGoDormant(
		template,
		form.values,
		now,
	);

	const workspacesToDormancyInWeek = useWorkspacesToGoDormant(
		template,
		form.values,
		weekFromNow,
	);

	const workspacesToBeDeletedNow = useWorkspacesToBeDeleted(
		template,
		form.values,
		now,
	);

	const workspacesToBeDeletedInWeek = useWorkspacesToBeDeleted(
		template,
		form.values,
		weekFromNow,
	);

	const showScheduleDialog =
		workspacesToDormancyNow &&
		workspacesToBeDeletedNow &&
		workspacesToDormancyInWeek &&
		workspacesToBeDeletedInWeek &&
		(workspacesToDormancyInWeek.length > 0 ||
			workspacesToBeDeletedInWeek.length > 0);

	const [isScheduleDialogOpen, setIsScheduleDialogOpen] =
		useState<boolean>(false);

	const submitValues = () => {
		const autostop_requirement_weeks = ["saturday", "sunday"].includes(
			form.values.autostop_requirement_days_of_week,
		)
			? form.values.autostop_requirement_weeks
			: 1;

		// on submit, convert from hours => ms
		onSubmit({
			default_ttl_ms: form.values.default_ttl_ms
				? form.values.default_ttl_ms * MS_HOUR_CONVERSION
				: undefined,
			// Activity bump has no effect without a default TTL, so
			// discard any stale value when default autostop is off.
			activity_bump_ms:
				form.values.default_ttl_ms && form.values.activity_bump_ms
					? form.values.activity_bump_ms * MS_HOUR_CONVERSION
					: undefined,
			failure_ttl_ms: form.values.failure_ttl_ms,
			time_til_dormant_ms: form.values.time_til_dormant_ms,
			time_til_dormant_autodelete_ms:
				form.values.time_til_dormant_autodelete_ms,
			autostop_requirement: {
				days_of_week: calculateAutostopRequirementDaysValue(
					form.values.autostop_requirement_days_of_week,
				),
				weeks: autostop_requirement_weeks,
			},
			autostart_requirement: {
				days_of_week: form.values.autostart_requirement_days_of_week,
			},
			allow_user_autostart: form.values.allow_user_autostart,
			allow_user_autostop: form.values.allow_user_autostop,
			update_workspace_last_used_at: form.values.update_workspace_last_used_at,
			update_workspace_dormant_at: form.values.update_workspace_dormant_at,
			disable_everyone_group_access: false,
		});
	};

	// Set autostop_requirement weeks to 1 when days_of_week is set to "off" or
	// "daily". Technically you can set weeks to a different value in the backend
	// and it will work, but this is a UX decision so users don't set days=daily
	// and weeks=2 and get confused when workspaces only restart daily during
	// every second week.
	//
	// We want to set the value to 1 when the user selects "off" or "daily"
	// because the input gets disabled so they can't change it to 1 themselves.
	const { values: currentValues, setValues } = form;
	useEffect(() => {
		if (
			!["saturday", "sunday"].includes(
				currentValues.autostop_requirement_days_of_week,
			) &&
			currentValues.autostop_requirement_weeks !== 1
		) {
			// This is async but we don't really need to await the value.
			void setValues({
				...currentValues,
				autostop_requirement_weeks: 1,
			});
		}
	}, [currentValues, setValues]);

	const handleToggleFailureCleanup = async (checked: boolean) => {
		await form.setValues({
			...form.values,
			failure_cleanup_enabled: checked,
			failure_ttl_ms: checked ? FAILURE_CLEANUP_DEFAULT : 0,
		});
	};

	const handleToggleInactivityCleanup = async (checked: boolean) => {
		await form.setValues({
			...form.values,
			inactivity_cleanup_enabled: checked,
			time_til_dormant_ms: checked ? INACTIVITY_CLEANUP_DEFAULT : 0,
		});
	};

	const handleToggleDormantAutoDeletion = async (checked: boolean) => {
		await form.setValues({
			...form.values,
			dormant_autodeletion_cleanup_enabled: checked,
			time_til_dormant_autodelete_ms: checked
				? DORMANT_AUTODELETION_DEFAULT
				: 0,
		});
	};

	return (
		<HorizontalForm
			onSubmit={form.handleSubmit}
			aria-label="模板设置表单"
		>
			<FormSection
				title="自动停止"
				description="定义从该模板创建的工作区何时停止。"
			>
				<FormFields className={FORM_FIELDS_GAP}>
					<TextField
						{...getFieldHelpers("default_ttl_ms", {
							helperText: (
								<DefaultTTLHelperText ttl={form.values.default_ttl_ms} />
							),
						})}
						disabled={isSubmitting}
						fullWidth
						inputProps={{ min: 0, step: 1 }}
						label="默认自动停止（小时）"
						type="number"
					/>

					<TextField
						{...getFieldHelpers("activity_bump_ms", {
							helperText: (
								<ActivityBumpHelperText
									bump={form.values.activity_bump_ms}
									defaultTTL={form.values.default_ttl_ms}
								/>
							),
						})}
						disabled={isSubmitting || !form.values.default_ttl_ms}
						fullWidth
						inputProps={{ min: 0, step: 1 }}
						label="活动延长（小时）"
						type="number"
					/>

					<div className="flex flex-row gap-4 w-full">
						<TextField
							{...getFieldHelpers("autostop_requirement_days_of_week", {
								helperText: (
									<AutostopRequirementDaysHelperText
										days={form.values.autostop_requirement_days_of_week}
									/>
								),
							})}
							disabled={isSubmitting}
							fullWidth
							select
							value={form.values.autostop_requirement_days_of_week}
							label="需要停止的日期"
						>
							<MenuItem key="off" value="off">
								关闭
							</MenuItem>
							<MenuItem key="daily" value="daily">
								每天
							</MenuItem>
							<MenuItem key="saturday" value="saturday">
								周六
							</MenuItem>
							<MenuItem key="sunday" value="sunday">
								周日
							</MenuItem>
						</TextField>

						<TextField
							{...getFieldHelpers("autostop_requirement_weeks", {
								helperText: (
									<AutostopRequirementWeeksHelperText
										days={form.values.autostop_requirement_days_of_week}
										weeks={form.values.autostop_requirement_weeks}
									/>
								),
							})}
							disabled={
								isSubmitting ||
								!["saturday", "sunday"].includes(
									form.values.autostop_requirement_days_of_week || "",
								)
							}
							fullWidth
							inputProps={{ min: 1, max: 16, step: 1 }}
							label="需要停止的间隔周数"
							type="number"
						/>
					</div>

					<div className="flex items-start">
						<Checkbox
							id="allow-user-autostop"
							disabled={isSubmitting || !allowAdvancedScheduling}
							onCheckedChange={async (checked) => {
								await form.setFieldValue(
									"allow_user_autostop",
									checked === true,
								);
							}}
							name="allow_user_autostop"
							checked={form.values.allow_user_autostop}
						/>
						<Label htmlFor="allow-user-autostop">
							<StackLabel>
								允许用户自定义工作区的自动停止持续时间。
								<StackLabelHelperText>
									默认情况下，工作区将继承此模板的自动停止计时器。启用此选项允许用户为其工作区设置自定义自动停止计时器或关闭计时器。
								</StackLabelHelperText>
							</StackLabel>
						</Label>
					</div>
				</FormFields>
			</FormSection>

			<FormSection
				title="自动启动"
				description="允许用户为从此模板创建的工作区设置自定义自动启动和自动停止调度选项。"
			>
				<div className="flex flex-col gap-4">
					<div className="flex items-start">
						<Checkbox
							id="allow_user_autostart"
							disabled={isSubmitting || !allowAdvancedScheduling}
							onCheckedChange={async (checked) => {
								await form.setFieldValue(
									"allow_user_autostart",
									checked === true,
								);
							}}
							name="allow_user_autostart"
							checked={form.values.allow_user_autostart}
						/>
						<Label htmlFor="allow_user_autostart">
							<StackLabel>
								允许用户按计划自动启动工作区。
							</StackLabel>
						</Label>
					</div>

					{allowAdvancedScheduling && (
						<TemplateScheduleAutostart
							enabled={Boolean(form.values.allow_user_autostart)}
							value={form.values.autostart_requirement_days_of_week}
							isSubmitting={isSubmitting}
							onChange={async (
								newDaysOfWeek: TemplateAutostartRequirementDaysValue[],
							) => {
								await form.setFieldValue(
									"autostart_requirement_days_of_week",
									newDaysOfWeek,
								);
							}}
						/>
					)}
				</div>
			</FormSection>

			{allowAdvancedScheduling && (
				<FormSection
					title="休眠"
					description="启用后，Coder 将在工作区长时间无连接后将其标记为休眠状态。休眠工作区可以自动删除（见下文），或由工作区所有者或管理员手动审查。"
				>
					<FormFields className={FORM_FIELDS_GAP}>
						<div className="flex flex-col gap-8">
							<div className="flex items-start">
								<Switch
									id="dormancyThreshold"
									name="dormancyThreshold"
									checked={form.values.inactivity_cleanup_enabled}
									onCheckedChange={handleToggleInactivityCleanup}
								/>
								<Label htmlFor="dormancyThreshold">
									<StackLabel>启用休眠阈值</StackLabel>
								</Label>
							</div>

							<DurationField
								{...getFieldHelpers("time_til_dormant_ms", {
									helperText: (
										<DormancyTTLHelperText
											ttl={form.values.time_til_dormant_ms}
										/>
									),
								})}
								label="进入休眠前时间"
								valueMs={form.values.time_til_dormant_ms ?? 0}
								onChange={(v) => form.setFieldValue("time_til_dormant_ms", v)}
								disabled={
									isSubmitting || !form.values.inactivity_cleanup_enabled
								}
							/>
						</div>

						<div className="flex flex-col gap-8">
							<div className="flex items-start">
								<Switch
									id="dormancyAutoDeletion"
									name="dormancyAutoDeletion"
									checked={form.values.dormant_autodeletion_cleanup_enabled}
									onCheckedChange={handleToggleDormantAutoDeletion}
								/>
								<Label htmlFor="dormancyAutoDeletion">
									<StackLabel>
										启用休眠自动删除
										<StackLabelHelperText>
											启用后，Coder 将在一段时间后永久删除休眠工作区。{" "}
											<strong>
												工作区一旦删除，将无法恢复。
											</strong>
										</StackLabelHelperText>
									</StackLabel>
								</Label>
							</div>
							<DurationField
								{...getFieldHelpers("time_til_dormant_autodelete_ms", {
									helperText: (
										<DormancyAutoDeletionTTLHelperText
											ttl={form.values.time_til_dormant_autodelete_ms}
										/>
									),
								})}
								label="删除前时间"
								valueMs={form.values.time_til_dormant_autodelete_ms ?? 0}
								onChange={(v) =>
									form.setFieldValue("time_til_dormant_autodelete_ms", v)
								}
								disabled={
									isSubmitting ||
									!form.values.dormant_autodeletion_cleanup_enabled
								}
							/>
						</div>

						<div className="flex flex-col gap-8">
							<div className="flex items-start">
								<Switch
									id="failureCleanupEnabled"
									name="failureCleanupEnabled"
									checked={form.values.failure_cleanup_enabled}
									onCheckedChange={handleToggleFailureCleanup}
								/>
								<Label htmlFor="failureCleanupEnabled">
									<StackLabel>
										启用失败清理
										<StackLabelHelperText>
											启用后，Coder 将尝试在一段时间后停止处于失败状态的工作区。
										</StackLabelHelperText>
									</StackLabel>
								</Label>
							</div>
							<DurationField
								{...getFieldHelpers("failure_ttl_ms", {
									helperText: (
										<FailureTTLHelperText ttl={form.values.failure_ttl_ms} />
									),
								})}
								label="清理前时间"
								valueMs={form.values.failure_ttl_ms ?? 0}
								onChange={(v) => form.setFieldValue("failure_ttl_ms", v)}
								disabled={isSubmitting || !form.values.failure_cleanup_enabled}
							/>
						</div>
					</FormFields>
				</FormSection>
			)}
			{showScheduleDialog && (
				<ScheduleDialog
					onConfirm={() => {
						submitValues();
						setIsScheduleDialogOpen(false);
						// These fields are request-scoped so they should be reset
						// after every submission.
						form
							.setFieldValue("update_workspace_dormant_at", false)
							.catch((error) => {
								throw error;
							});
						form
							.setFieldValue("update_workspace_last_used_at", false)
							.catch((error) => {
								throw error;
							});
					}}
					inactiveWorkspacesToGoDormant={workspacesToDormancyNow.length}
					inactiveWorkspacesToGoDormantInWeek={
						workspacesToDormancyInWeek.length - workspacesToDormancyNow.length
					}
					dormantWorkspacesToBeDeleted={workspacesToBeDeletedNow.length}
					dormantWorkspacesToBeDeletedInWeek={
						workspacesToBeDeletedInWeek.length - workspacesToBeDeletedNow.length
					}
					open={isScheduleDialogOpen}
					onClose={() => {
						setIsScheduleDialogOpen(false);
					}}
					title="工作区调度"
					updateDormantWorkspaces={(update: boolean) =>
						form.setFieldValue("update_workspace_dormant_at", update)
					}
					updateInactiveWorkspaces={(update: boolean) =>
						form.setFieldValue("update_workspace_last_used_at", update)
					}
					dormantValueChanged={
						form.initialValues.time_til_dormant_ms !==
						form.values.time_til_dormant_ms
					}
					deletionValueChanged={
						form.initialValues.time_til_dormant_autodelete_ms !==
						form.values.time_til_dormant_autodelete_ms
					}
				/>
			)}

			<FormFooter>
				<Button onClick={onCancel} variant="outline">
					取消
				</Button>

				<Button
					type="submit"
					disabled={isSubmitting || !form.isValid || !form.dirty}
				>
					<Spinner loading={isSubmitting} />
					保存
				</Button>
			</FormFooter>
		</HorizontalForm>
	);
};
