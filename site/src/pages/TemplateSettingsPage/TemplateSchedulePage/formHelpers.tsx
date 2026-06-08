import * as Yup from "yup";
import type { UpdateTemplateMeta } from "#/api/typesGenerated";
import type {
	TemplateAutostartRequirementDaysValue,
	TemplateAutostopRequirementDaysValue,
} from "#/utils/schedule";

export interface TemplateScheduleFormValues
	extends Omit<
		UpdateTemplateMeta,
		"autostop_requirement" | "autostart_requirement"
	> {
	autostart_requirement_days_of_week: TemplateAutostartRequirementDaysValue[];
	autostop_requirement_days_of_week: TemplateAutostopRequirementDaysValue;
	autostop_requirement_weeks: number;
	failure_cleanup_enabled: boolean;
	inactivity_cleanup_enabled: boolean;
	dormant_autodeletion_cleanup_enabled: boolean;
}

const MAX_TTL_DAYS = 30;

export const getValidationSchema = (): Yup.AnyObjectSchema =>
	Yup.object({
		default_ttl_ms: Yup.number()
			.integer("默认自动停止等待时间必须是整数。")
			.required()
			.min(0, "默认自动停止等待时间不能小于0。")
			.max(
				24 * MAX_TTL_DAYS /* 30 days in hours */,
				"请输入小于或等于720小时（30天）的限制。",
			),
		activity_bump_ms: Yup.number()
			.integer("活动延长值必须为整数。")
			.required()
			.min(0, "活动延长值不能小于0。")
			.max(
				24 * MAX_TTL_DAYS /* 30 days in hours */,
				"请输入小于或等于720小时（30天）的活动延长持续时间。",
			),
		failure_ttl_ms: Yup.number()
			.integer("失败清理天数必须是整数。")
			.required()
			.min(0, "失败清理天数不能小于0。")
			.test(
				"positive-if-enabled",
				"启用时失败清理天数必须大于零。",
				function (value) {
					const parent = this.parent as TemplateScheduleFormValues;
					if (!parent.failure_cleanup_enabled) {
						return true;
					}
					return Boolean(value);
				},
			),
		time_til_dormant_ms: Yup.number()
			.integer("休眠阈值必须是整数。")
			.required()
			.min(0, "休眠阈值不能小于0。")
			.test(
				"positive-if-enabled",
				"启用时休眠阈值必须大于零。",
				function (value) {
					const parent = this.parent as TemplateScheduleFormValues;
					if (parent.inactivity_cleanup_enabled) {
						return Boolean(value);
					}
					return true;
				},
			),
		time_til_dormant_autodelete_ms: Yup.number()
			.integer("休眠自动删除天数必须是整数。")
			.required()
			.min(0, "休眠自动删除天数不能小于0。")
			.test(
				"positive-if-enabled",
				"启用时休眠自动删除天数必须大于零。",
				function (value) {
					const parent = this.parent as TemplateScheduleFormValues;
					if (parent.dormant_autodeletion_cleanup_enabled) {
						return Boolean(value);
					}
					return true;
				},
			),
		allow_user_autostart: Yup.boolean(),
		allow_user_autostop: Yup.boolean(),

		autostop_requirement_days_of_week: Yup.string().required(),
		autostart_requirement_days_of_week: Yup.array().of(Yup.string()).required(),
		autostop_requirement_weeks: Yup.number().required().min(1).max(16),
	});
