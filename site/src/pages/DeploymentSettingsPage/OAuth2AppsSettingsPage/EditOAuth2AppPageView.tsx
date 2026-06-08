import { useTheme } from "@emotion/react";
import Divider from "@mui/material/Divider";
import { ChevronLeftIcon, CopyIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";
import type * as TypesGen from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { CodeExample } from "#/components/CodeExample/CodeExample";
import { CopyableValue } from "#/components/CopyableValue/CopyableValue";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import { Loader } from "#/components/Loader/Loader";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import { createDayString } from "#/utils/createDayString";
import { OAuth2AppForm } from "./OAuth2AppForm";

type MutatingResource = {
	updateApp: boolean;
	createSecret: boolean;
	deleteApp: boolean;
	deleteSecret: boolean;
};

type EditOAuth2AppProps = {
	app?: TypesGen.OAuth2ProviderApp;
	isLoadingApp: boolean;
	isLoadingSecrets: boolean;
	// mutatingResource indicates which resources, if any, are currently being
	// mutated.
	mutatingResource: MutatingResource;
	updateApp: (req: TypesGen.PutOAuth2ProviderAppRequest) => void;
	deleteApp: (name: string) => void;
	generateAppSecret: () => void;
	deleteAppSecret: (id: string) => void;
	canEditApp: boolean;
	canDeleteApp: boolean;
	canViewAppSecrets: boolean;
	secrets?: readonly TypesGen.OAuth2ProviderAppSecret[];
	fullNewSecret?: TypesGen.OAuth2ProviderAppSecretFull;
	ackFullNewSecret: () => void;
	error?: unknown;
};

export const EditOAuth2AppPageView: FC<EditOAuth2AppProps> = ({
	app,
	isLoadingApp,
	isLoadingSecrets,
	mutatingResource,
	updateApp,
	deleteApp,
	generateAppSecret,
	deleteAppSecret,
	canEditApp,
	canDeleteApp,
	canViewAppSecrets,
	secrets,
	fullNewSecret,
	ackFullNewSecret,
	error,
}) => {
	const theme = useTheme();
	const [searchParams] = useSearchParams();
	const [showDelete, setShowDelete] = useState<boolean>(false);

	return (
		<>
			<div className="flex flex-row gap-4 items-baseline justify-between">
				<SettingsHeader>
					<SettingsHeaderTitle>编辑 OAuth2 应用</SettingsHeaderTitle>
					<SettingsHeaderDescription>
						配置一个应用，将 Coder 用作 OAuth2 提供者。
					</SettingsHeaderDescription>
				</SettingsHeader>

				<Button variant="outline" asChild>
					<RouterLink to="/deployment/oauth2-provider/apps">
						<ChevronLeftIcon />
						所有 OAuth2 应用
					</RouterLink>
				</Button>
			</div>

			{fullNewSecret && (
				<ConfirmDialog
					hideCancel
					open={Boolean(fullNewSecret)}
					onConfirm={ackFullNewSecret}
					onClose={ackFullNewSecret}
					title="OAuth2 客户端密钥"
					confirmText="确定"
					description={
						<>
							<p>
								您的新客户端密钥如下所示。请立即复制；之后将无法再次查看。
							</p>
							<CodeExample
								code={fullNewSecret.client_secret_full}
								className="min-h-auto select-all w-full mt-6"
							/>
						</>
					}
				/>
			)}

			<div className="flex flex-col gap-4">
				{searchParams.has("created") && (
					<Alert severity="info" dismissible>
						您的 OAuth2 应用已创建。在下方生成一个客户端密钥，即可开始使用您的应用。
					</Alert>
				)}

				{error ? <ErrorAlert error={error} /> : undefined}

				{isLoadingApp && <Loader />}

				{!isLoadingApp && app && (
					<>
						<DeleteDialog
							isOpen={showDelete}
							confirmLoading={mutatingResource.deleteApp}
							name={app.name}
							entity="OAuth2 应用"
							info="删除此 OAuth2 应用将立即使与之相关的所有活动会话和 API 密钥失效。当前通过此应用认证的用户将被登出，并需要重新认证。"
							onConfirm={() => deleteApp(app.name)}
							onCancel={() => setShowDelete(false)}
						/>

						<dl className="grid [grid-template-columns:max-content_auto] [&>dd]:ml-2.5 [&>dt]:font-bold">
							<dt>客户端 ID</dt>
							<dd>
								<CopyableValue value={app.id} side="right">
									{app.id} <CopyIcon className="size-icon-xs" />
								</CopyableValue>
							</dd>
							<dt>授权 URL</dt>
							<dd>
								<CopyableValue value={app.endpoints.authorization} side="right">
									{app.endpoints.authorization}{" "}
									<CopyIcon className="size-icon-xs" />
								</CopyableValue>
							</dd>
							<dt>令牌 URL</dt>
							<dd>
								<CopyableValue value={app.endpoints.token} side="right">
									{app.endpoints.token} <CopyIcon className="size-icon-xs" />
								</CopyableValue>
							</dd>
						</dl>

						<Divider css={{ borderColor: theme.palette.divider }} />

						<OAuth2AppForm
							app={app}
							onSubmit={updateApp}
							isUpdating={mutatingResource.updateApp}
							error={error}
							actions={
								<Button
									variant="destructive"
									onClick={() => setShowDelete(true)}
									disabled={!canDeleteApp}
								>
									删除&hellip;
								</Button>
							}
							disabled={!canEditApp}
						/>

						{canViewAppSecrets && (
							<>
								<Divider css={{ borderColor: theme.palette.divider }} />

								<OAuth2AppSecretsTable
									secrets={secrets}
									generateAppSecret={generateAppSecret}
									deleteAppSecret={deleteAppSecret}
									isLoadingSecrets={isLoadingSecrets}
									mutatingResource={mutatingResource}
								/>
							</>
						)}
					</>
				)}
			</div>
		</>
	);
};

type OAuth2AppSecretsTableProps = {
	secrets?: readonly TypesGen.OAuth2ProviderAppSecret[];
	generateAppSecret: () => void;
	isLoadingSecrets: boolean;
	mutatingResource: MutatingResource;
	deleteAppSecret: (id: string) => void;
};

const OAuth2AppSecretsTable: FC<OAuth2AppSecretsTableProps> = ({
	secrets,
	generateAppSecret,
	isLoadingSecrets,
	mutatingResource,
	deleteAppSecret,
}) => {
	return (
		<>
			<div className="flex flex-row gap-4 items-baseline justify-between">
				<h2>客户端密钥</h2>
				<Button
					disabled={mutatingResource.createSecret}
					type="submit"
					onClick={generateAppSecret}
				>
					<Spinner loading={mutatingResource.createSecret} />
					生成密钥
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[80%]">密钥</TableHead>
						<TableHead className="w-[20%]">上次使用</TableHead>
						<TableHead className="w-[1%]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoadingSecrets && <TableLoader />}
					{!isLoadingSecrets && (!secrets || secrets.length === 0) && (
						<TableRow>
							<TableCell colSpan={999}>
								<div className="text-center">
									尚未生成任何客户端密钥。
								</div>
							</TableCell>
						</TableRow>
					)}
					{!isLoadingSecrets &&
						secrets?.map((secret) => (
							<OAuth2SecretRow
								key={secret.id}
								secret={secret}
								mutatingResource={mutatingResource}
								deleteAppSecret={deleteAppSecret}
							/>
						))}
				</TableBody>
			</Table>
		</>
	);
};

type OAuth2SecretRowProps = {
	secret: TypesGen.OAuth2ProviderAppSecret;
	deleteAppSecret: (id: string) => void;
	mutatingResource: MutatingResource;
};

const OAuth2SecretRow: FC<OAuth2SecretRowProps> = ({
	secret,
	deleteAppSecret,
	mutatingResource,
}) => {
	const [showDelete, setShowDelete] = useState<boolean>(false);

	return (
		<TableRow key={secret.id} data-testid={`secret-${secret.id}`}>
			<TableCell>*****{secret.client_secret_truncated}</TableCell>
			<TableCell data-chromatic="ignore">
				{secret.last_used_at ? createDayString(secret.last_used_at) : "从未"}
			</TableCell>
			<TableCell>
				<ConfirmDialog
					type="delete"
					hideCancel={false}
					open={showDelete}
					onConfirm={() => deleteAppSecret(secret.id)}
					onClose={() => setShowDelete(false)}
					title="删除 OAuth2 客户端密钥"
					confirmLoading={mutatingResource.deleteSecret}
					confirmText="删除"
					description={
						<>
							删除 <strong>*****{secret.client_secret_truncated}</strong> 是不可逆的，并将撤销由其生成的所有令牌。您确定要继续吗？
						</>
					}
				/>
				<Button variant="destructive" onClick={() => setShowDelete(true)}>
					删除&hellip;
				</Button>
			</TableCell>
		</TableRow>
	);
};
