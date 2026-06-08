import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { type FC, useState } from "react";
import * as Yup from "yup";
import { isApiValidationError } from "#/api/errors";
import type {
	Organization,
	ShareableWorkspaceOwners,
	UpdateOrganizationRequest,
} from "#/api/typesGenerated";
import { Alert, AlertTitle } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { Checkbox } from "#/components/Checkbox/Checkbox";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "#/components/Form/Form";
import { IconField } from "#/components/IconField/IconField";
import { RadioGroup, RadioGroupItem } from "#/components/RadioGroup/RadioGroup";
import {
	SettingsHeader,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	displayNameValidator,
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "#/utils/formUtils";
import { DisableWorkspaceSharingDialog } from "./DisableWorkspaceSharingDialog";
import { HorizontalContainer, HorizontalSection } from "./Horizontal";

const MAX_DESCRIPTION_CHAR_LIMIT = 128;
const MAX_DESCRIPTION_MESSAGE = `请输入不超过 ${MAX_DESCRIPTION_CHAR_LIMIT} 个字符的描述。`;

const validationSchema = Yup.object({
	name: nameValidator("名称"),
	display_name: displayNameValidator("显示名称"),
	description: Yup.string().max(
		MAX_DESCRIPTION_CHAR_LIMIT,
		MAX_DESCRIPTION_MESSAGE,
	),
});

interface OrganizationSettingsPageViewProps {
	organization: Organization;
	error: unknown;
	onSubmit: (values: UpdateOrganizationRequest) => Promise<void>;
	onDeleteOrganization: () => void;
	workspaceSharingGloballyDisabled?: boolean;
	shareableWorkspaceOwners: ShareableWorkspaceOwners;
	onChangeShareableOwners: (value: ShareableWorkspaceOwners) => void;
	isTogglingWorkspaceSharing: boolean;
}

export const OrganizationSettingsPageView: FC<
	OrganizationSettingsPageViewProps
> = ({
	organization,
	error,
	onSubmit,
	onDeleteOrganization,
	workspaceSharingGloballyDisabled,
	shareableWorkspaceOwners,
	onChangeShareableOwners,
	isTogglingWorkspaceSharing,
}) => {
	const form = useFormik<UpdateOrganizationRequest>({
		initialValues: {
			name: organization.name,
			display_name: organization.display_name,
			description: organization.description,
			icon: organization.icon,
		},
		validationSchema,
		onSubmit,
		enableReinitialize: true,
	});
	const getFieldHelpers = getFormHelpers(form, error);

	const [isDeleting, setIsDeleting] = useState(false);
	const [pendingSharingChange, setPendingSharingChange] =
		useState<ShareableWorkspaceOwners | null>(null);

	return (
		<div className="w-full max-w-screen-2xl pb-10">
			<SettingsHeader>
				<SettingsHeaderTitle>设置</SettingsHeaderTitle>
			</SettingsHeader>

			{Boolean(error) && !isApiValidationError(error) && (
				<div className="mb-8">
					<ErrorAlert error={error} />
				</div>
			)}

			<HorizontalForm
				onSubmit={form.handleSubmit}
				aria-label="组织设置表单"
			>
				<FormSection
					title="信息"
					description="组织的名称和描述。"
				>
					<fieldset
						disabled={form.isSubmitting}
						className="border-0 p-0 m-0 w-full"
					>
						<FormFields>
							<TextField
								{...getFieldHelpers("name")}
								onChange={onChangeTrimmed(form)}
								autoFocus
								fullWidth
								label="标识符"
							/>
							<TextField
								{...getFieldHelpers("display_name")}
								fullWidth
								label="显示名称"
							/>
							<TextField
								{...getFieldHelpers("description")}
								multiline
								fullWidth
								label="描述"
								rows={2}
							/>
							<IconField
								{...getFieldHelpers("icon")}
								onChange={onChangeTrimmed(form)}
								fullWidth
								onPickEmoji={(value) => form.setFieldValue("icon", value)}
							/>
						</FormFields>
					</fieldset>
				</FormSection>

				<FormFooter>
					<Button type="submit" disabled={form.isSubmitting}>
						<Spinner loading={form.isSubmitting} />
						保存
					</Button>
				</FormFooter>
			</HorizontalForm>

			{onChangeShareableOwners && (
				<HorizontalContainer className="mt-12">
					<HorizontalSection
						title="工作区共享"
						description="控制工作区所有者是否可以共享其工作区。"
					>
						<div className="flex flex-col gap-2">
							{workspaceSharingGloballyDisabled && (
								<Alert severity="warning" className="mb-4">
									<AlertTitle>已被部署设置禁用</AlertTitle>
									工作区共享已被管理员禁止。在此组织中使用共享前，必须由管理员先允许共享。
								</Alert>
							)}
							<div className="flex items-start gap-3">
								<Checkbox
									id="workspace-sharing"
									checked={
										!workspaceSharingGloballyDisabled &&
										shareableWorkspaceOwners !== "none"
									}
									disabled={
										workspaceSharingGloballyDisabled ||
										isTogglingWorkspaceSharing
									}
									onCheckedChange={(checked) => {
										if (checked) {
											// Default to service_accounts when enabling.
											onChangeShareableOwners("service_accounts");
										} else {
											setPendingSharingChange("none");
										}
									}}
								/>
								<div className="flex flex-col gap-3">
									<div className="flex flex-col">
										<label
											htmlFor="workspace-sharing"
											className="text-sm cursor-pointer"
										>
											允许工作区共享
										</label>
										<div className="text-xs text-content-secondary">
											启用后，工作区所有者可以将其工作区共享给此组织中的其他用户。
										</div>
									</div>
									{shareableWorkspaceOwners !== "none" &&
										!workspaceSharingGloballyDisabled && (
											<RadioGroup
												value={shareableWorkspaceOwners}
												onValueChange={(value) => {
													const newValue = value as ShareableWorkspaceOwners;
													// Transitioning from "everyone" to "service_accounts"
													// is destructive, so show the warning dialog.
													// Otherwise, just change.
													if (
														shareableWorkspaceOwners === "everyone" &&
														newValue === "service_accounts"
													) {
														setPendingSharingChange("service_accounts");
													} else {
														onChangeShareableOwners(newValue);
													}
												}}
												disabled={isTogglingWorkspaceSharing}
												className="ml-1"
											>
												<div className="flex items-start gap-2">
													<RadioGroupItem
														value="service_accounts"
														id="sharing-service-accounts"
														className="mt-0.5"
													/>
													<div className="flex flex-col">
														<label
															htmlFor="sharing-service-accounts"
															className="text-sm cursor-pointer"
														>
															仅服务帐户可以共享工作区
														</label>
														<span className="text-xs text-content-secondary">
															服务帐户是通常用于自动化、CI/CD 管道和集中管理的共享环境且无需登录的帐户。
														</span>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<RadioGroupItem
														value="everyone"
														id="sharing-everyone"
													/>
													<label
														htmlFor="sharing-everyone"
														className="text-sm cursor-pointer"
													>
														所有成员都可以共享工作区
													</label>
												</div>
											</RadioGroup>
										)}
								</div>
							</div>
						</div>
					</HorizontalSection>
				</HorizontalContainer>
			)}

			{!organization.is_default && (
				<HorizontalContainer className="mt-12">
					<HorizontalSection
						title="删除组织"
						description="永久删除您的组织。"
					>
						<div className="flex flex-col gap-4 flex-grow">
							<div className="flex bg-surface-orange items-center justify-between border border-solid border-orange-600 rounded-md p-3 pl-4 gap-2">
								<span>删除组织是不可逆的。</span>
								<Button
									variant="destructive"
									onClick={() => setIsDeleting(true)}
									className="min-w-fit"
								>
									删除此组织
								</Button>
							</div>
						</div>
					</HorizontalSection>
				</HorizontalContainer>
			)}

			<DeleteDialog
				isOpen={isDeleting}
				onConfirm={async () => {
					await onDeleteOrganization();
					setIsDeleting(false);
				}}
				onCancel={() => setIsDeleting(false)}
				entity="组织"
				name={organization.name}
			/>

			<DisableWorkspaceSharingDialog
				isOpen={pendingSharingChange !== null}
				organizationId={organization.id}
				newSetting={pendingSharingChange ?? "none"}
				onConfirm={async () => {
					if (pendingSharingChange !== null) {
						await onChangeShareableOwners(pendingSharingChange);
					}
					setPendingSharingChange(null);
				}}
				onCancel={() => setPendingSharingChange(null)}
				isLoading={isTogglingWorkspaceSharing}
			/>
		</div>
	);
};
