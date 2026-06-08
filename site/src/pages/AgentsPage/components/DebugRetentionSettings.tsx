import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import * as Yup from "yup";
import type * as TypesGen from "#/api/typesGenerated";
import { DefaultChatDebugRetentionDays } from "#/api/typesGenerated";
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

interface DebugRetentionSettingsProps {
	debugRetentionDaysData: TypesGen.ChatDebugRetentionDaysResponse | undefined;
	isDebugRetentionDaysLoading: boolean;
	isDebugRetentionDaysLoadError: boolean;
	onSaveDebugRetentionDays: (
		req: TypesGen.UpdateChatDebugRetentionDaysRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingDebugRetentionDays: boolean;
	isSaveDebugRetentionDaysError: boolean;
}

// Keep in sync with chatDebugRetentionDaysMaximum in coderd/exp_chats.go.
const validationSchema = Yup.object({
	debug_retention_days: Yup.number()
		.integer("调试数据保留天数必须为整数。")
		.min(1, "调试数据保留期至少需要 1 天。")
		.max(3650, "不得超过 3650 天（约 10 年）。")
		.required("调试数据保留天数为必填项。"),
});

export const DebugRetentionSettings: FC<DebugRetentionSettingsProps> = ({
	debugRetentionDaysData,
	isDebugRetentionDaysLoading,
	isDebugRetentionDaysLoadError,
	onSaveDebugRetentionDays,
	isSavingDebugRetentionDays,
	isSaveDebugRetentionDaysError,
}) => {
	const [debugRetentionToggled, setDebugRetentionToggled] = useState<
		boolean | null
	>(null);
	const { isSavedVisible, showSavedState } = useTemporarySavedState();

	const serverDebugRetentionDays =
		debugRetentionDaysData?.debug_retention_days ??
		DefaultChatDebugRetentionDays;
	const isDebugRetentionEnabled =
		debugRetentionToggled ?? serverDebugRetentionDays > 0;

	const form = useFormik({
		initialValues: { debug_retention_days: serverDebugRetentionDays },
		enableReinitialize: true,
		validationSchema,
		onSubmit: (values, helpers) => {
			onSaveDebugRetentionDays(
				{ debug_retention_days: values.debug_retention_days },
				{
					onSuccess: () => {
						showSavedState();
						setDebugRetentionToggled(null);
						helpers.resetForm();
					},
				},
			);
		},
	});

	const resetDebugRetentionState = () => {
		setDebugRetentionToggled(null);
		form.resetForm();
	};

	const handleToggleDebugRetention = (checked: boolean) => {
		if (checked) {
			const days =
				serverDebugRetentionDays > 0
					? serverDebugRetentionDays
					: DefaultChatDebugRetentionDays;
			setDebugRetentionToggled(true);
			void form.setFieldValue("debug_retention_days", days);
			onSaveDebugRetentionDays(
				{ debug_retention_days: days },
				{
					onSuccess: resetDebugRetentionState,
					onError: resetDebugRetentionState,
				},
			);
		} else {
			setDebugRetentionToggled(false);
			void form.setFieldValue("debug_retention_days", 0);
			onSaveDebugRetentionDays(
				{ debug_retention_days: 0 },
				{
					onSuccess: resetDebugRetentionState,
					onError: resetDebugRetentionState,
				},
			);
		}
	};

	return (
		<form className="flex flex-col gap-2" onSubmit={form.handleSubmit}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h3 className="m-0 text-sm font-semibold text-content-primary">
						聊天调试数据保留
					</h3>
				</div>
				<Switch
					checked={isDebugRetentionEnabled}
					onCheckedChange={handleToggleDebugRetention}
					aria-label="启用聊天调试数据保留"
					disabled={isSavingDebugRetentionDays || isDebugRetentionDaysLoading}
				/>
			</div>
			<p className="!mt-0.5 m-0 flex-1 text-xs text-content-secondary">
				超过此期限的聊天调试运行和调试步骤将自动删除。这不控制聊天消息的保留。
			</p>
			{isDebugRetentionEnabled && (
				<>
					<div className="flex gap-2">
						<Input
							type="number"
							name="debug_retention_days"
							min={1}
							max={3650}
							step={1}
							aria-label="聊天调试数据保留期限（天）"
							value={form.values.debug_retention_days}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							aria-invalid={Boolean(form.errors.debug_retention_days)}
							disabled={
								isSavingDebugRetentionDays || isDebugRetentionDaysLoading
							}
							className="flex-1"
						/>
						<span className="flex h-10 w-[120px] items-center px-3 text-sm text-content-secondary">
							天
						</span>
					</div>
					{form.errors.debug_retention_days &&
						form.touched.debug_retention_days && (
							<p className="m-0 text-xs text-content-destructive">
								{form.errors.debug_retention_days}
							</p>
						)}
					<div className="mt-2 flex min-h-6 justify-end">
						{(form.dirty || isSavedVisible || isSavingDebugRetentionDays) &&
							(isSavedVisible ? (
								<TemporarySavedState />
							) : (
								<Button
									size="xs"
									type="submit"
									disabled={
										isSavingDebugRetentionDays ||
										!form.dirty ||
										Boolean(form.errors.debug_retention_days)
									}
								>
									{isSavingDebugRetentionDays && (
										<Spinner loading className="h-4 w-4" />
									)}
									保存
								</Button>
							))}
					</div>
				</>
			)}
			{isSaveDebugRetentionDaysError && (
				<p className="m-0 text-xs text-content-destructive">
					聊天调试保留设置保存失败。
				</p>
			)}
			{isDebugRetentionDaysLoadError && (
				<p className="m-0 text-xs text-content-destructive">
					聊天调试保留设置加载失败。
				</p>
			)}
		</form>
	);
};
