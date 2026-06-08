import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { type FC, useRef, useState } from "react";
import type {
	CreateUserSecretRequest,
	UpdateUserSecretRequest,
	UserSecret,
} from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { FeatureStageBadge } from "#/components/FeatureStageBadge/FeatureStageBadge";
import { Link } from "#/components/Link/Link";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { Spinner } from "#/components/Spinner/Spinner";
import { docs } from "#/utils/docs";
import { SecretDialog } from "./SecretDialog";
import { SecretsTable } from "./SecretsTable";

type SecretsPageViewProps = {
	secrets?: readonly UserSecret[];
	isLoading: boolean;
	hasLoaded: boolean;
	isRefreshing: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	getSecretsError?: unknown;
	onRefresh: () => void;
	onCreateSecret: (
		request: CreateUserSecretRequest,
	) => Promise<UserSecret> | UserSecret;
	onUpdateSecret: (
		name: string,
		request: UpdateUserSecretRequest,
	) => Promise<UserSecret> | UserSecret;
	onDeleteSecret: (secret: UserSecret) => Promise<void> | void;
};

type SecretDialogState =
	| { mode: "add"; open: boolean }
	| { mode: "edit"; open: boolean; secret: UserSecret };

export const SecretsPageView: FC<SecretsPageViewProps> = ({
	secrets = [],
	isLoading,
	hasLoaded,
	isRefreshing,
	isCreating,
	isUpdating,
	isDeleting,
	getSecretsError,
	onRefresh,
	onCreateSecret,
	onUpdateSecret,
	onDeleteSecret,
}) => {
	const [dialogState, setDialogState] = useState<SecretDialogState>({
		mode: "add",
		open: false,
	});
	const secretDialogReturnFocusElement = useRef<HTMLElement | null>(null);
	const dialogSecret =
		dialogState.mode === "edit" ? dialogState.secret : undefined;
	const hasLoadedSecrets = hasLoaded && !getSecretsError;

	const openAddSecret = (returnFocusElement?: HTMLElement | null) => {
		secretDialogReturnFocusElement.current = returnFocusElement ?? null;
		setDialogState({ mode: "add", open: true });
	};
	const openEditSecret = (
		secret: UserSecret,
		returnFocusElement?: HTMLElement | null,
	) => {
		secretDialogReturnFocusElement.current = returnFocusElement ?? null;
		setDialogState({ mode: "edit", open: true, secret });
	};
	const closeSecretDialog = () => {
		setDialogState((state) => ({ ...state, open: false }));
	};

	return (
		<div className="flex flex-col gap-6">
			<SettingsHeader
				actions={
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							onClick={onRefresh}
							disabled={isLoading || isRefreshing}
						>
							<Spinner loading={isLoading || isRefreshing}>
								<RefreshCwIcon />
							</Spinner>
							刷新
						</Button>
					</div>
				}
			>
				<SettingsHeaderTitle
					tooltip={<FeatureStageBadge contentType="beta" size="md" />}
				>
					密钥
				</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					设置环境变量或文件路径的密钥会在您拥有的工作区启动时注入其中。每个环境变量和文件路径必须唯一。{" "}
					<Link
						href={docs("/user-guides/user-secrets")}
						target="_blank"
						rel="noreferrer"
						showExternalIcon={false}
					>
						查看文档
					</Link>
				</SettingsHeaderDescription>
			</SettingsHeader>

			<SecretDialog
				open={dialogState.open}
				secret={dialogSecret}
				isSubmitting={isCreating || isUpdating}
				returnFocusElement={secretDialogReturnFocusElement.current}
				onClose={closeSecretDialog}
				onCreateSecret={onCreateSecret}
				onUpdateSecret={onUpdateSecret}
			/>

			{getSecretsError ? <ErrorAlert error={getSecretsError} /> : undefined}

			<section className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4">
					<h2 className="m-0 text-xl font-semibold">您的密钥</h2>
					<Button onClick={(event) => openAddSecret(event.currentTarget)}>
						<PlusIcon />
						添加密钥
					</Button>
				</div>

				<SecretsTable
					secrets={secrets}
					isLoading={isLoading}
					hasLoaded={hasLoadedSecrets}
					isDeleting={isDeleting}
					onAddSecret={openAddSecret}
					onEditSecret={openEditSecret}
					onDeleteSecret={onDeleteSecret}
				/>
			</section>
		</div>
	);
};
