import type { Theme } from "@emotion/react";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import upperFirst from "lodash/upperFirst";
import type { FC } from "react";
import * as Yup from "yup";
import {
	type AutomaticUpdates,
	AutomaticUpdateses,
	type Workspace,
} from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "#/components/Form/Form";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "#/utils/formUtils";

export type WorkspaceSettingsFormValues = {
	name: string;
	automatic_updates: AutomaticUpdates;
};

const AUTOMATIC_UPDATE_DISPLAY_NAMES: Record<AutomaticUpdates, string> = {
	always: "始终",
	never: "从不",
};

interface WorkspaceSettingsFormProps {
	workspace: Workspace;
	error: unknown;
	onCancel: () => void;
	onSubmit: (values: WorkspaceSettingsFormValues) => Promise<void>;
}

export const WorkspaceSettingsForm: FC<WorkspaceSettingsFormProps> = ({
	onCancel,
	onSubmit,
	workspace,
	error,
}) => {
	const formEnabled =
		!workspace.template_require_active_version || workspace.allow_renames;

	const form = useFormik<WorkspaceSettingsFormValues>({
		onSubmit,
		initialValues: {
			name: workspace.name,
			automatic_updates: workspace.automatic_updates,
		},
		validationSchema: Yup.object({
			name: nameValidator("名称"),
			automatic_updates: Yup.string().oneOf(AutomaticUpdateses),
		}),
	});
	const getFieldHelpers = getFormHelpers<WorkspaceSettingsFormValues>(
		form,
		error,
	);

	return (
		<HorizontalForm onSubmit={form.handleSubmit} data-testid="form">
			<FormSection
				title="工作区名称"
				description="更新您的工作区名称。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("name")}
						disabled={!workspace.allow_renames || form.isSubmitting}
						onChange={onChangeTrimmed(form)}
						autoFocus
						fullWidth
						label="名称"
						css={workspace.allow_renames && styles.nameWarning}
						helperText={
							workspace.allow_renames
								? form.values.name !== form.initialValues.name &&
									"根据模板，重命名您的工作区可能具有破坏性"
								: "重命名工作区可能具有破坏性，且已被模板禁用。"
						}
					/>
				</FormFields>
			</FormSection>
			<FormSection
				title="自动更新"
				description="配置您的工作区在启动时自动更新。"
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("automatic_updates")}
						id="automatic_updates"
						label="更新策略"
						value={
							workspace.template_require_active_version
								? "always"
								: form.values.automatic_updates
						}
						select
						disabled={
							form.isSubmitting || workspace.template_require_active_version
						}
						helperText={
							workspace.template_require_active_version &&
							"此工作区的模板要求自动更新。"
						}
					>
						{AutomaticUpdateses.map((value) => (
							<MenuItem value={value} key={value}>
								{AUTOMATIC_UPDATE_DISPLAY_NAMES[value] ?? upperFirst(value)}
							</MenuItem>
						))}
					</TextField>
				</FormFields>
			</FormSection>
			{formEnabled && (
				<FormFooter>
					<Button onClick={onCancel} variant="outline">
						取消
					</Button>

					<Button type="submit" disabled={form.isSubmitting}>
						<Spinner loading={form.isSubmitting} />
						保存
					</Button>
				</FormFooter>
			)}
		</HorizontalForm>
	);
};

const styles = {
	nameWarning: (theme: Theme) => ({
		"& .MuiFormHelperText-root": {
			color: theme.palette.warning.light,
		},
	}),
};
