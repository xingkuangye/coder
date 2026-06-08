import { TriangleAlertIcon } from "lucide-react";
import type { FC } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { Badge } from "#/components/Badge/Badge";
import { Link } from "#/components/Link/Link";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/Select/Select";
import { Skeleton } from "#/components/Skeleton/Skeleton";
import { Switch } from "#/components/Switch/Switch";

interface MutationCallbacks {
	onSuccess?: () => void;
	onError?: () => void;
}

interface VirtualDesktopSettingsProps {
	desktopEnabledData: TypesGen.ChatDesktopEnabledResponse | undefined;
	isLoadingDesktopEnabled: boolean;
	onSaveDesktopEnabled: (
		req: TypesGen.UpdateChatDesktopEnabledRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingDesktopEnabled: boolean;
	isSaveDesktopEnabledError: boolean;
	computerUseProviderData: TypesGen.ChatComputerUseProviderResponse | undefined;
	isLoadingComputerUseProvider: boolean;
	onSaveComputerUseProvider: (
		req: TypesGen.UpdateChatComputerUseProviderRequest,
		options?: MutationCallbacks,
	) => void;
	isSavingComputerUseProvider: boolean;
	computerUseProviderSaveError: Error | null;
}

const computerUseProviderOptions = [
	{ label: "Anthropic", value: "anthropic" },
	{ label: "OpenAI", value: "openai" },
] as const;

const getComputerUseProviderLabel = (provider: string) => {
	return (
		computerUseProviderOptions.find((option) => option.value === provider)
			?.label ?? provider
	);
};

export const VirtualDesktopSettings: FC<VirtualDesktopSettingsProps> = ({
	desktopEnabledData,
	isLoadingDesktopEnabled,
	onSaveDesktopEnabled,
	isSavingDesktopEnabled,
	isSaveDesktopEnabledError,
	computerUseProviderData,
	isLoadingComputerUseProvider,
	onSaveComputerUseProvider,
	isSavingComputerUseProvider,
	computerUseProviderSaveError,
}) => {
	const desktopEnabled = desktopEnabledData?.enable_desktop ?? false;
	const computerUseProvider = computerUseProviderData?.provider ?? "";
	const isDesktopSwitchDisabled =
		isSavingDesktopEnabled || isLoadingDesktopEnabled;
	const isComputerUseProviderSelectDisabled =
		!desktopEnabled ||
		isSavingDesktopEnabled ||
		isLoadingDesktopEnabled ||
		isSavingComputerUseProvider ||
		isLoadingComputerUseProvider;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h3 className="m-0 text-sm font-semibold text-content-primary">
						虚拟桌面
					</h3>
					<Badge size="sm" variant="warning" className="cursor-default">
						<TriangleAlertIcon className="size-3" />
						实验性功能
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					{isLoadingDesktopEnabled ? (
						<Skeleton className="h-5 w-10 rounded-full" aria-hidden="true" />
					) : (
						<Switch
							checked={desktopEnabled}
							onCheckedChange={(checked) =>
								onSaveDesktopEnabled({ enable_desktop: checked })
							}
							aria-label="启用"
							disabled={isDesktopSwitchDisabled}
						/>
					)}
				</div>
			</div>
			<div className="m-0 flex-1 text-xs text-content-secondary">
				<p className="m-0">
					允许智能体在工作空间内使用虚拟图形桌面。
					需要安装{" "}
					<Link
						href="https://registry.coder.com/modules/coder/portabledesktop"
						target="_blank"
						size="sm"
					>
						portabledesktop 模块
					</Link>{" "}
					并配置选定的计算机使用提供程序。
				</p>
			</div>
			<div className="ml-2 flex flex-col gap-2 border-0 border-l border-solid border-border pl-4 pt-2 sm:ml-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
				<div className="flex flex-col gap-1">
					<h4
						id="computer-use-provider-label"
						className="m-0 text-sm font-medium text-content-primary"
					>
						计算机使用提供程序
					</h4>
					<p
						id="computer-use-provider-description"
						className="m-0 text-xs text-content-secondary"
					>
						选择虚拟桌面启用时，智能体执行计算机使用操作所用的提供程序。
					</p>
				</div>
				<Select
					value={computerUseProvider}
					onValueChange={(provider) => onSaveComputerUseProvider({ provider })}
					disabled={isComputerUseProviderSelectDisabled}
				>
					<SelectTrigger
						aria-labelledby="computer-use-provider-label"
						aria-describedby="computer-use-provider-description"
						className="w-full sm:w-44"
					>
						<SelectValue placeholder="选择提供程序">
							{isLoadingComputerUseProvider ? (
								<Skeleton className="h-4 w-20" aria-hidden="true" />
							) : computerUseProvider ? (
								getComputerUseProviderLabel(computerUseProvider)
							) : undefined}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="end" className="min-w-[11rem]">
						<SelectGroup>
							{computerUseProviderOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			{isSaveDesktopEnabledError && (
				<p className="m-0 text-xs text-content-destructive">
					保存桌面设置失败。
				</p>
			)}
			{computerUseProviderSaveError && (
				<p className="m-0 text-xs text-content-destructive">
					保存计算机使用提供程序失败。
				</p>
			)}
		</div>
	);
};
