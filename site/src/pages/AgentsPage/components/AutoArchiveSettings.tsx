import { useFormik } from "formik";
import type { FC } from "react";
import { useState } from "react";
import * as Yup from "yup";
import type * as TypesGen from "#/api/typesGenerated";
import { DefaultChatAutoArchiveDays } from "#/api/typesGenerated";
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

interface AutoArchiveSettingsProps {
	autoArchiveDaysData: TypesGen.ChatAutoArchiveDaysResponse | undefined;
	isAutoArchiveDaysLoading: boolean;
	isAutoArchiveDaysLoadError: boolean;
	onSaveAutoArchiveDays: (
		req: TypesGen.UpdateChatAutoArchiveDaysRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingAutoArchiveDays: boolean;
	isSaveAutoArchiveDaysError: boolean;
}

// Keep in sync with autoArchiveDaysMaximum in coderd/exp_chats.go.
const validationSchema = Yup.object({
	auto_archive_days: Yup.number()
		.integer("自动归档天数必须为整数。")
		.min(1, "自动归档期限至少为 1 天。")
		.max(3650, "不得超过 3650 天（约 10 年）。")
		.required("自动归档天数为必填项。"),
});

// Sensible default offered when an admin enables auto-archive for
// the first time. Distinct from the server default (0 = disabled).
const ENABLE_DEFAULT_DAYS = 90;

export const AutoArchiveSettings: FC<AutoArchiveSettingsProps> = ({
	autoArchiveDaysData,
	isAutoArchiveDaysLoading,
	isAutoArchiveDaysLoadError,
	onSaveAutoArchiveDays,
	isSavingAutoArchiveDays,
	isSaveAutoArchiveDaysError,
}) => {
	const [archiveToggled, setArchiveToggled] = useState<boolean | null>(null);
	const { isSavedVisible, showSavedState } = useTemporarySavedState();

	const serverAutoArchiveDays =
		autoArchiveDaysData?.auto_archive_days ?? DefaultChatAutoArchiveDays;
	const isAutoArchiveEnabled = archiveToggled ?? serverAutoArchiveDays > 0;

	const form = useFormik({
		initialValues: { auto_archive_days: serverAutoArchiveDays },
		enableReinitialize: true,
		validationSchema,
		onSubmit: (values, helpers) => {
			onSaveAutoArchiveDays(
				{ auto_archive_days: values.auto_archive_days },
				{
					onSuccess: () => {
						showSavedState();
						setArchiveToggled(null);
						helpers.resetForm();
					},
				},
			);
		},
	});

	const resetArchiveState = () => {
		setArchiveToggled(null);
		form.resetForm();
	};

	const handleToggleAutoArchive = (checked: boolean) => {
		if (checked) {
			const days =
				serverAutoArchiveDays > 0 ? serverAutoArchiveDays : ENABLE_DEFAULT_DAYS;
			setArchiveToggled(true);
			void form.setFieldValue("auto_archive_days", days);
			onSaveAutoArchiveDays(
				{ auto_archive_days: days },
				{
					onSuccess: resetArchiveState,
					onError: resetArchiveState,
				},
			);
		} else {
			setArchiveToggled(false);
			void form.setFieldValue("auto_archive_days", 0);
			onSaveAutoArchiveDays(
				{ auto_archive_days: 0 },
				{
					onSuccess: resetArchiveState,
					onError: resetArchiveState,
				},
			);
		}
	};

	return (
		<form className="flex flex-col gap-2" onSubmit={form.handleSubmit}>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h3 className="m-0 text-sm font-semibold text-content-primary">
						自动归档不活跃对话
					</h3>
				</div>
				<Switch
					checked={isAutoArchiveEnabled}
					onCheckedChange={handleToggleAutoArchive}
					aria-label="启用自动归档"
					disabled={isSavingAutoArchiveDays || isAutoArchiveDaysLoading}
				/>
			</div>
			<p className="!mt-0.5 m-0 flex-1 text-xs text-content-secondary">
				不活跃对话将在此期限后自动归档。已置顶对话除外。
			</p>
			{isAutoArchiveEnabled && (
				<>
					<div className="flex gap-2">
						<Input
							type="number"
							name="auto_archive_days"
							min={1}
							max={3650}
							step={1}
							aria-label="自动归档期限（天）"
							value={form.values.auto_archive_days}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							aria-invalid={Boolean(form.errors.auto_archive_days)}
							disabled={isSavingAutoArchiveDays || isAutoArchiveDaysLoading}
							className="flex-1"
						/>
						<span className="flex h-10 w-[120px] items-center px-3 text-sm text-content-secondary">
							天
						</span>
					</div>
					{form.errors.auto_archive_days && form.touched.auto_archive_days && (
						<p className="m-0 text-xs text-content-destructive">
							{form.errors.auto_archive_days}
						</p>
					)}
					<div className="mt-2 flex min-h-6 justify-end">
						{(form.dirty || isSavedVisible || isSavingAutoArchiveDays) &&
							(isSavedVisible ? (
								<TemporarySavedState />
							) : (
								<Button
									size="xs"
									type="submit"
									disabled={
										isSavingAutoArchiveDays ||
										!form.dirty ||
										Boolean(form.errors.auto_archive_days)
									}
								>
									{isSavingAutoArchiveDays && (
										<Spinner loading className="h-4 w-4" />
									)}
									保存
								</Button>
							))}
					</div>
				</>
			)}
			{isSaveAutoArchiveDaysError && (
				<p className="m-0 text-xs text-content-destructive">
					无法保存自动归档设置。
				</p>
			)}
			{isAutoArchiveDaysLoadError && (
				<p className="m-0 text-xs text-content-destructive">
					无法加载自动归档设置。
				</p>
			)}
		</form>
	);
};
