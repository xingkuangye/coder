import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	externalAuths,
	unlinkExternalAuths,
	validateExternalAuth,
} from "#/api/queries/externalAuth";
import type { ExternalAuthLinkProvider } from "#/api/typesGenerated";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import {
	SettingsHeader,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { ExternalAuthPageView } from "./ExternalAuthPageView";

const ExternalAuthPage: FC = () => {
	const queryClient = useQueryClient();
	// This is used to tell the child components something was unlinked and things
	// need to be refetched
	const [unlinked, setUnlinked] = useState(0);

	const externalAuthsQuery = useQuery(externalAuths());
	const [appToUnlink, setAppToUnlink] = useState<ExternalAuthLinkProvider>();
	const unlinkAppMutation = useMutation(unlinkExternalAuths(queryClient));
	const validateAppMutation = useMutation(validateExternalAuth(queryClient));

	return (
		<>
			<SettingsHeader>
				<SettingsHeaderTitle>外部认证</SettingsHeaderTitle>
			</SettingsHeader>
			<ExternalAuthPageView
				isLoading={externalAuthsQuery.isLoading}
				getAuthsError={externalAuthsQuery.error}
				auths={externalAuthsQuery.data}
				unlinked={unlinked}
				onUnlinkExternalAuth={(provider) => {
					setAppToUnlink(provider);
				}}
				onValidateExternalAuth={async (providerID: string) => {
					try {
						const data = await validateAppMutation.mutateAsync(providerID);
						if (data.authenticated) {
							toast.success("应用链接有效。");
						} else {
							toast.error("应用链接无效。", {
								description:
									"请取消链接该应用并重新认证。",
							});
						}
					} catch (error) {
						toast.error(
							getErrorMessage(error, "验证应用链接时出错。"),
							{
								description: getErrorDetail(error),
							},
						);
					}
				}}
			/>
			<DeleteDialog
				key={appToUnlink?.id}
				title="取消链接应用"
				verb="正在取消链接"
				info={
					appToUnlink?.supports_revocation
						? "此操作将移除外部认证链接，并尝试从 OAuth2 提供方撤销访问令牌。无论令牌撤销是否成功，认证链接都会被移除。"
						: "此操作不会从 OAuth2 提供方撤销访问令牌。它仅移除本地的链接。要完全撤销访问权限，您必须在 OAuth2 提供方执行。"
				}
				label="要取消链接的应用名称"
				isOpen={appToUnlink !== undefined}
				confirmLoading={unlinkAppMutation.isPending}
				name={appToUnlink?.id ?? ""}
				entity="application"
				onCancel={() => setAppToUnlink(undefined)}
				onConfirm={async () => {
					if (!appToUnlink) {
						return;
					}
					try {
						const unlinkResp = await unlinkAppMutation.mutateAsync(
							appToUnlink.id,
						);
						// setAppToUnlink closes the modal
						setAppToUnlink(undefined);
						// refetch repopulates the external auth data
						await externalAuthsQuery.refetch();
						// this tells our child components to refetch their data
						// as at least 1 provider was unlinked.
						setUnlinked(unlinked + 1);
						toast.success(
							unlinkResp.token_revoked
								? "已成功删除外部认证链接并从 OAuth2 提供方撤销令牌。"
								: "已成功删除外部认证链接。令牌未从 OAuth2 提供方撤销。",
						);
					} catch (e) {
						toast.error(getErrorMessage(e, "取消链接应用时出错。"), {
							description: getErrorDetail(e),
						});
					}
				}}
			/>
		</>
	);
};

export default ExternalAuthPage;
