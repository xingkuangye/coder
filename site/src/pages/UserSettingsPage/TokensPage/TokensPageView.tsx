import { useTheme } from "@emotion/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TrashIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import type { APIKeyWithOwner } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableEmpty } from "#/components/TableEmpty/TableEmpty";
import { TableLoader } from "#/components/TableLoader/TableLoader";

dayjs.extend(relativeTime);

const lastUsedOrNever = (lastUsed: string) => {
	const t = dayjs(lastUsed);
	const now = dayjs();
	return now.isBefore(t.add(100, "year")) ? t.fromNow() : "从未使用";
};

interface TokensPageViewProps {
	tokens?: APIKeyWithOwner[];
	getTokensError?: unknown;
	isLoading: boolean;
	hasLoaded: boolean;
	onDelete: (token: APIKeyWithOwner) => void;
	deleteTokenError?: unknown;
	children?: ReactNode;
}

export const TokensPageView: FC<TokensPageViewProps> = ({
	tokens,
	getTokensError,
	isLoading,
	hasLoaded,
	onDelete,
	deleteTokenError,
}) => {
	return (
		<div className="flex flex-col gap-4">
			{Boolean(getTokensError) && <ErrorAlert error={getTokensError} />}
			{Boolean(deleteTokenError) && <ErrorAlert error={deleteTokenError} />}

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1/5">ID</TableHead>
						<TableHead className="w-1/5">名称</TableHead>
						<TableHead className="w-1/5">最后使用</TableHead>
						<TableHead className="w-1/5">过期时间</TableHead>
						<TableHead className="w-1/5">创建时间</TableHead>
						<TableHead className="w-[1%]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					<TokensTableBody
						tokens={tokens}
						isLoading={isLoading}
						hasLoaded={hasLoaded}
						onDelete={onDelete}
					/>
				</TableBody>
			</Table>
		</div>
	);
};

interface TokensTableBodyProps {
	tokens?: APIKeyWithOwner[];
	isLoading: boolean;
	hasLoaded: boolean;
	onDelete: (token: APIKeyWithOwner) => void;
}

const TokensTableBody: FC<TokensTableBodyProps> = ({
	tokens,
	isLoading,
	hasLoaded,
	onDelete,
}) => {
	const theme = useTheme();

	if (isLoading) {
		return <TableLoader />;
	}
	if (hasLoaded && (!tokens || tokens.length === 0)) {
		return <TableEmpty message="未找到令牌" />;
	}
	return (
		<>
			{tokens?.map((token) => (
				<TableRow key={token.id} data-testid={`token-${token.id}`} tabIndex={0}>
					<TableCell>
						<span style={{ color: theme.palette.text.secondary }}>
							{token.id}
						</span>
					</TableCell>

					<TableCell>
						<span style={{ color: theme.palette.text.secondary }}>
							{token.token_name}
						</span>
					</TableCell>

					<TableCell>{lastUsedOrNever(token.last_used)}</TableCell>

					<TableCell>
						<span
							style={{ color: theme.palette.text.secondary }}
							data-chromatic="ignore"
						>
							{dayjs(token.expires_at).fromNow()}
						</span>
					</TableCell>

					<TableCell>
						<span style={{ color: theme.palette.text.secondary }}>
							{dayjs(token.created_at).fromNow()}
						</span>
					</TableCell>

					<TableCell>
						<span style={{ color: theme.palette.text.secondary }}>
							<Button
								onClick={() => {
									onDelete(token);
								}}
								size="icon"
								variant="destructive"
								aria-label="删除令牌"
							>
								<TrashIcon className="size-icon-sm" />
							</Button>
						</span>
					</TableCell>
				</TableRow>
			))}
		</>
	);
};
