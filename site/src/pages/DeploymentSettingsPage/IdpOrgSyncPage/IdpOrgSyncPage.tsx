import { type FC, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { deploymentIdpSyncFieldValues } from "#/api/queries/deployment";
import {
	organizationIdpSyncSettings,
	patchOrganizationSyncSettings,
} from "#/api/queries/idpsync";
import { Link } from "#/components/Link/Link";
import { Loader } from "#/components/Loader/Loader";
import { PaywallPremium } from "#/components/Paywall/PaywallPremium";
import { useDashboard } from "#/modules/dashboard/useDashboard";
import { useFeatureVisibility } from "#/modules/dashboard/useFeatureVisibility";
import { docs } from "#/utils/docs";
import { pageTitle } from "#/utils/page";
import { ExportPolicyButton } from "./ExportPolicyButton";
import { IdpOrgSyncPageView } from "./IdpOrgSyncPageView";

const IdpOrgSyncPage: FC = () => {
	const queryClient = useQueryClient();
	// IdP sync does not have its own entitlement and is based on templace_rbac
	const { template_rbac: isIdpSyncEnabled } = useFeatureVisibility();
	const { organizations } = useDashboard();
	const settingsQuery = useQuery(organizationIdpSyncSettings(isIdpSyncEnabled));

	const [field, setField] = useState("");
	useEffect(() => {
		if (!settingsQuery.data) {
			return;
		}

		setField(settingsQuery.data.field);
	}, [settingsQuery.data]);

	const fieldValuesQuery = useQuery({
		...deploymentIdpSyncFieldValues(field),
		enabled: Boolean(field),
	});

	const patchOrganizationSyncSettingsMutation = useMutation(
		patchOrganizationSyncSettings(queryClient),
	);

	useEffect(() => {
		if (patchOrganizationSyncSettingsMutation.error) {
			toast.error(
				getErrorMessage(
					patchOrganizationSyncSettingsMutation.error,
					"更新组织 IdP 同步设置时出错。",
				),
			);
		}
	}, [patchOrganizationSyncSettingsMutation.error]);

	if (settingsQuery.isLoading) {
		return <Loader />;
	}

	return (
		<>
			<title>{pageTitle("组织 IdP 同步")}</title>

			<div className="flex flex-col gap-12">
				<header className="flex flex-row items-baseline justify-between">
					<div className="flex flex-col gap-2">
						<h1 className="text-3xl m-0">组织 IdP 同步</h1>
						<p className="flex flex-row gap-1 text-sm text-content-secondary font-medium m-0">
							根据用户的 IdP 声明自动将用户分配到组织。
							<Link href={docs("/admin/users/idp-sync#organization-sync")}>
								查看文档
							</Link>
						</p>
					</div>
					<ExportPolicyButton syncSettings={settingsQuery.data} />
				</header>
				{!isIdpSyncEnabled ? (
					<PaywallPremium
						message="IdP 组织同步"
						description="配置组织映射，将您的身份验证提供商中的声明同步到 Coder 内的组织。您需要 Premium 许可证才能使用此功能。"
						documentationLink={docs("/admin/users/idp-sync")}
					/>
				) : (
					<IdpOrgSyncPageView
						organizationSyncSettings={settingsQuery.data}
						claimFieldValues={fieldValuesQuery.data}
						organizations={organizations}
						onSyncFieldChange={setField}
						onSubmit={async (data) => {
							try {
								await patchOrganizationSyncSettingsMutation.mutateAsync(data);
								toast.success("组织同步设置已更新。");
							} catch (error) {
								toast.error(
									getErrorMessage(
										error,
										"无法更新组织 IdP 同步设置。",
									),
									{
										description: getErrorDetail(error),
									},
								);
							}
						}}
						error={settingsQuery.error || fieldValuesQuery.error}
					/>
				)}
			</div>
		</>
	);
};

export default IdpOrgSyncPage;
