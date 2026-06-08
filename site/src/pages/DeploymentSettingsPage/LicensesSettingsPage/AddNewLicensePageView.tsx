import TextField from "@mui/material/TextField";
import { ChevronLeftIcon } from "lucide-react";
import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import { toast } from "sonner";
import { getErrorDetail } from "#/api/errors";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { FileUpload } from "#/components/FileUpload/FileUpload";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Fieldset } from "../Fieldset";
import { DividerWithText } from "./DividerWithText";

type AddNewLicenseProps = {
	onSaveLicenseKey: (license: string) => void;
	isSavingLicense: boolean;
	savingLicenseError?: unknown;
};

export const AddNewLicensePageView: FC<AddNewLicenseProps> = ({
	onSaveLicenseKey,
	isSavingLicense,
	savingLicenseError,
}) => {
	function handleFileUploaded(files: File[]) {
		const fileReader = new FileReader();
		fileReader.onload = () => {
			const licenseKey = fileReader.result as string;

			onSaveLicenseKey(licenseKey);

			fileReader.onerror = (error) => {
				toast.error("读取文件失败。", {
					description: getErrorDetail(error),
				});
			};
		};

		fileReader.readAsText(files[0]);
	}

	const isUploading = false;

	function onUpload(file: File) {
		handleFileUploaded([file]);
	}

	return (
		<>
			<div className="flex flex-row gap-4 items-baseline justify-between">
				<SettingsHeader>
					<SettingsHeaderTitle>添加许可证</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						获取高可用性、RBAC、配额等功能。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Button asChild variant="outline">
					<RouterLink to="/deployment/licenses">
						<ChevronLeftIcon />
						所有许可证
					</RouterLink>
				</Button>
			</div>

			{savingLicenseError && <ErrorAlert error={savingLicenseError} />}

			<FileUpload
				isUploading={isUploading}
				onUpload={onUpload}
				removeLabel="移除文件"
				title="上传您的许可证"
				description="选择包含您的许可证密钥的文本文件。"
			/>

			<div className="flex flex-col gap-4 pt-10">
				<DividerWithText>或者</DividerWithText>

				<Fieldset
					title="粘贴您的许可证"
					onSubmit={(e) => {
						e.preventDefault();

						const form = e.target;
						const formData = new FormData(form as HTMLFormElement);

						const licenseKey = formData.get("licenseKey");

						onSaveLicenseKey(licenseKey?.toString() || "");
					}}
					button={
						<Button type="submit" disabled={isSavingLicense}>
							上传许可证
						</Button>
					}
				>
					<TextField
						name="licenseKey"
						placeholder="输入您的许可证..."
						multiline
						rows={3}
						fullWidth
					/>
				</Fieldset>
			</div>
		</>
	);
};
