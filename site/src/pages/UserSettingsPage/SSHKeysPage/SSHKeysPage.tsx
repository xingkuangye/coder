import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import { regenerateUserSSHKey, userSSHKey } from "#/api/queries/sshKeys";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import {
	SettingsHeader,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { SSHKeysPageView } from "./SSHKeysPageView";

const SSHKeysPage: FC = () => {
	const [isConfirmingRegeneration, setIsConfirmingRegeneration] =
		useState(false);

	const userSSHKeyQuery = useQuery(userSSHKey("me"));
	const queryClient = useQueryClient();
	const regenerateSSHKeyMutation = useMutation(
		regenerateUserSSHKey("me", queryClient),
	);

	return (
		<>
			<SettingsHeader>
				<SettingsHeaderTitle>SSH 密钥</SettingsHeaderTitle>
			</SettingsHeader>
			<SSHKeysPageView
				isLoading={userSSHKeyQuery.isLoading}
				getSSHKeyError={userSSHKeyQuery.error}
				sshKey={userSSHKeyQuery.data}
				onRegenerateClick={() => setIsConfirmingRegeneration(true)}
			/>

			<ConfirmDialog
				type="delete"
				hideCancel={false}
				open={isConfirmingRegeneration}
				confirmLoading={regenerateSSHKeyMutation.isPending}
				title="重新生成 SSH 密钥？"
				description="您需要在使用的服务上替换公钥，并且需要重新构建现有的工作空间。"
				confirmText="确认"
				onClose={() => setIsConfirmingRegeneration(false)}
				onConfirm={async () => {
					try {
						await regenerateSSHKeyMutation.mutateAsync();
						toast.success("SSH 密钥已成功重新生成。");
					} catch (error) {
						toast.error(
							getErrorMessage(error, "重新生成 SSH 密钥失败"),
							{
								description: getErrorDetail(error),
							},
						);
					} finally {
						setIsConfirmingRegeneration(false);
					}
				}}
			/>
		</>
	);
};

export default SSHKeysPage;
