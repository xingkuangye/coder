import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import * as Yup from "yup";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Input } from "#/components/Input/Input";
import { Spinner } from "#/components/Spinner/Spinner";
import { Switch } from "#/components/Switch/Switch";
import {
	TemporarySavedState,
	useTemporarySavedState,
} from "./TemporarySavedState";

interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface RetentionPeriodSettingsProps {
	retentionDaysData: TypesGen.ChatRetentionDaysResponse | undefined;
	isRetentionDaysLoading: boolean;
	isRetentionDaysLoadError: boolean;
	onSaveRetentionDays: (
		req: TypesGen.UpdateChatRetentionDaysRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingRetentionDays: boolean;
	isSaveRetentionDaysError: boolean;
}

// Keep in sync with retentionDaysMaximum in coderd/exp_chats.go.
const validationSchema = Yup.object({
	retention_days: Yup.number()
		.integer("保留天数必须为整数。")
		.min(1, "保留期限至少为1天。")
		.max(3650, "不得超过3650天（约10年）。")
		.required("保留天数为必填。"),
});

export const RetentionPeriodSettings: FC<RetentionPeriodSettingsProps> = ({
	retentionDaysData,
	isRetentionDaysLoading,
	isRetentionDaysLoadError,
	onSaveRetentionDays,
	isSavingRetentionDays,
	isSaveRetentionDaysError,
}) => {
	const [retentionToggled, setRetentionToggled] = useState<boolean | null>(
		null,
	);
	const { isSavedVisible, showSavedState } = useTemporarySavedState();

	const serverRetentionDays = retentionDaysData?.retention_days ?? 30;
	const isRetentionEnabled = retentionToggled ?? serverRetentionDays > 0;

	const form = useFormik({
		initialValues: { retention_days: serverRetentionDays },
		enableReinitialize: true,
		validationSchema,
		onSubmit: (values, helpers) => {
			onSaveRetentionDays(
				{ retention_days: values.retention_days },
				{
					onSuccess: () => {
						showSavedState();
						setRetentionToggled(null);
						helpers.resetForm();
					},
				},
			);
		},
	});

	const resetRetentionState = () => {
		setRetentionToggled(null);
		form.resetForm();
	};

	const handleToggleRetention = (checked: boolean) => {
		if (checked) {
			const days = serverRetentionDays > 0 ? serverRetentionDays : 30;
			setRetentionToggled(true);
			void form.setFieldValue("retention_days", days);
			onSaveRetentionDays(
				{ retention_days: days },
				{
					onSuccess: resetRetentionState,
					onError: resetRetentionState,
				},
			);
		} else {
			setRetentionToggled(false);
			void form.setFieldValue("retention_days", 0);
			onSaveRetentionDays(
				{ retention_days: 0 },
				{
					onSuccess: resetRetentionState,
					onError: resetRetentionState,
				},
			);
		}
	};

	return (
		<form className="flex flex-col gap-2" onSubmit={form.handleSubmit}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h3 className="m-0 text-sm font-semibold text-content-primary">
						对话保留期限
					</h3>
				</div>
				<Switch
					checked={isRetentionEnabled}
					onCheckedChange={handleToggleRetention}
					aria-label="启用对话保留"
					disabled={isSavingRetentionDays || isRetentionDaysLoading}
				/>
			</div>
			<p className="!mt-0.5 m-0 flex-1 text-xs text-content-secondary">
				超过此期限的已归档对话和孤立文件将自动删除。
			</p>
			{isRetentionEnabled && (
				<>
					<div className="flex gap-2">
						<Input
							type="number"
							name="retention_days"
							min={1}
							max={3650}
							step={1}
							aria-label="对话保留天数"
							value={form.values.retention_days}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							aria-invalid={Boolean(form.errors.retention_days)}
							disabled={isSavingRetentionDays || isRetentionDaysLoading}
							className="flex-1"
						/>
						<span className="flex h-10 w-[120px] items-center px-3 text-sm text-content-secondary">
							天
						</span>
					</div>
					{form.errors.retention_days && form.touched.retention_days && (
						<p className="m-0 text-xs text-content-destructive">
							{form.errors.retention_days}
						</p>
					)}
					<div className="mt-2 flex min-h-6 justify-end">
						{(form.dirty || isSavedVisible || isSavingRetentionDays) &&
							(isSavedVisible ? (
								<TemporarySavedState />
							) : (
								<Button
									size="xs"
									type="submit"
									disabled={
										isSavingRetentionDays ||
										!form.dirty ||
										Boolean(form.errors.retention_days)
									}
								>
									{isSavingRetentionDays && (
										<Spinner loading className="h-4 w-4" />
									)}
									保存
								</Button>
							))}
					</div>
				</>
			)}
			{isSaveRetentionDaysError && (
				<p className="m-0 text-xs text-content-destructive">
					保存保留设置失败。
				</p>
			)}
			{isRetentionDaysLoadError && (
				<p className="m-0 text-xs text-content-destructive">
					加载保留设置失败。
				</p>
			)}
		</form>
	);
};
