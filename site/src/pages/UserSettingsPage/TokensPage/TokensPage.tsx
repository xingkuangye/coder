import { PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Link as RouterLink } from "react-router";
import type { APIKeyWithOwner } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useTokensData } from "./hooks";
import { TokensPageView } from "./TokensPageView";

const cliCreateCommand = "coder tokens create";

const TokensPage: FC = () => {
	const [tokenToDelete, setTokenToDelete] = useState<
		APIKeyWithOwner | undefined
	>(undefined);

	const {
		data: tokens,
		error: getTokensError,
		isFetching,
		isFetched,
		queryKey,
	} = useTokensData({
		// we currently do not show all tokens in the UI, even if
		// the user has read all permissions
		include_all: false,
		include_expired: false,
	});

	return (
		<>
			<SettingsHeader
				actions={
					<Button asChild variant="outline">
						<RouterLink to="new">
							<PlusIcon />
							添加令牌
						</RouterLink>
					</Button>
				}
			>
				<SettingsHeaderTitle>令牌</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					令牌用于与 Coder API 进行身份验证。您可以使用 Coder CLI 的{" "}
					<code className="bg-surface-secondary text-content-primary text-xs px-1 py-0.5 rounded-sm">
						{cliCreateCommand}
					</code>{" "}
					命令创建令牌。
				</SettingsHeaderDescription>
			</SettingsHeader>
			<TokensPageView
				tokens={tokens}
				isLoading={isFetching}
				hasLoaded={isFetched}
				getTokensError={getTokensError}
				onDelete={(token) => {
					setTokenToDelete(token);
				}}
			/>
			<ConfirmDeleteDialog
				queryKey={queryKey}
				token={tokenToDelete}
				setToken={setTokenToDelete}
			/>
		</>
	);
};

export default TokensPage;
