import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router";
import type { AIProvider } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { Link } from "#/components/Link/Link";
import {
	SettingsHeader,
	SettingsHeaderDescription,
	SettingsHeaderTitle,
} from "#/components/SettingsHeader/SettingsHeader";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { TableEmpty } from "#/components/TableEmpty/TableEmpty";
import { TableLoader } from "#/components/TableLoader/TableLoader";
import { addableProviders } from "#/pages/AISettingsPage/ProvidersPage/components/addableProviderTypes";
import { ProviderIcon } from "#/pages/AISettingsPage/ProvidersPage/components/ProviderIcon";
import { ProviderRow } from "#/pages/AISettingsPage/ProvidersPage/components/ProviderRow";
import { docs } from "#/utils/docs";

interface ProvidersPageViewProps {
	isLoading: boolean;
	isFetching: boolean;
	error: unknown;
	providers: AIProvider[];
}

const AddProviderDropdown: React.FC<{ align?: "start" | "end" }> = ({
	align = "end",
}) => {
	const navigate = useNavigate();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<PlusIcon />
					<span>添加提供商</span>
					<ChevronDownIcon className="ml-1 size-icon-xs" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align} className="min-w-56">
				<div className="px-2 py-1.5 text-xs font-medium text-content-secondary">
					选择一个提供商
				</div>
				{addableProviders.map((entry) => (
					<DropdownMenuItem
						key={entry.value}
						onSelect={() =>
							void navigate(
								`/ai/settings/add?type=${encodeURIComponent(entry.value)}`,
							)
						}
					>
						<ProviderIcon provider={entry.value} />
						<span>{entry.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const ProvidersPageView: React.FC<ProvidersPageViewProps> = ({
	isLoading,
	isFetching,
	error,
	providers,
}) => {
	const navigate = useNavigate();

	return (
		<div>
			<SettingsHeader actions={<AddProviderDropdown />}>
				<SettingsHeaderTitle>提供商</SettingsHeaderTitle>
				<SettingsHeaderDescription>
					连接第三方服务，如 OpenAI、Anthropic 或 Amazon Bedrock。在此配置的提供商将为 Coder Agents、AI 网关以及其他使用 LLM 的功能（如 API、CLI 或 IDE）提供支持。默认情况下，用户可以为任何提供商提供自己的密钥。{" "}
					<Link href={docs("/ai-coder/ai-gateway/auth#enable-or-disable-byok")}>
						查看文档
					</Link>
				</SettingsHeaderDescription>
			</SettingsHeader>
			{Boolean(error) && (
				<div className="mb-4">
					<ErrorAlert error={error} />
				</div>
			)}
			<Table className="table-fixed" aria-label="AI 提供商">
				<TableHeader>
					<TableRow>
						<TableHead className="w-1/3">名称</TableHead>
						<TableHead className="w-1/3">基础 URL</TableHead>
						<TableHead className="w-22">状态</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading || isFetching ? (
						<TableLoader />
					) : providers.length === 0 ? (
						<TableEmpty
							message="未配置提供商"
							cta={<AddProviderDropdown align="start" />}
						/>
					) : (
						providers.map((provider) => (
							<ProviderRow
								key={provider.name}
								provider={provider}
								onClick={() => navigate(`/ai/settings/${provider.name}`)}
							/>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default ProvidersPageView;
