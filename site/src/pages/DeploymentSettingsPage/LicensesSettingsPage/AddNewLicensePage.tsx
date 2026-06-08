import type { FC } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail } from "#/api/errors";
import { pageTitle } from "#/utils/page";
import { AddNewLicensePageView } from "./AddNewLicensePageView";

const AddNewLicensePage: FC = () => {
	const navigate = useNavigate();

	const {
		mutate: saveLicenseKeyApi,
		isPending: isCreating,
		error: savingLicenseError,
	} = useMutation({
		mutationFn: API.createLicense,
		onSuccess: () => {
			toast.success("您已成功添加许可证。");
			navigate("/deployment/licenses?success=true");
		},
		onError: (error) =>
			toast.error("保存许可证密钥失败。", {
				description: getErrorDetail(error),
			}),
	});

	function saveLicenseKey(licenseKey: string) {
		saveLicenseKeyApi(
			{ license: licenseKey },
			{
				onSuccess: () => {
					toast.success("您已成功添加许可证。");
					navigate("/deployment/licenses?success=true");
				},
				onError: (error) =>
					toast.error("保存许可证密钥失败。", {
						description: getErrorDetail(error),
					}),
			},
		);
	}

	return (
		<>
			<title>{pageTitle("许可证设置")}</title>

			<AddNewLicensePageView
				isSavingLicense={isCreating}
				savingLicenseError={savingLicenseError}
				onSaveLicenseKey={saveLicenseKey}
			/>
		</>
	);
};

export default AddNewLicensePage;
