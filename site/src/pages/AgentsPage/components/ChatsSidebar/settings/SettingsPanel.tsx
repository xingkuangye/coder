import {
	ArrowLeftIcon,
	ArrowUpRightIcon,
	BotIcon,
	BoxesIcon,
	ChevronRightIcon,
	CoinsIcon,
	FlaskConicalIcon,
	KeyIcon,
	LayoutTemplateIcon,
	PanelLeftCloseIcon,
	PlugIcon,
	ReceiptTextIcon,
	RefreshCwIcon,
	ServerIcon,
	Settings2Icon,
	ShrinkIcon,
	UserIcon,
} from "lucide-react";
import type { FC } from "react";
import { Link, type Location } from "react-router";
import { Button } from "#/components/Button/Button";
import { cn } from "#/utils/cn";
import { SettingsNavItem } from "./SettingsNavItem";

interface SettingsPanelProps {
	readonly isSettingsPanel: boolean;
	readonly settingsPanel: "settings" | "settings-admin";
	readonly settingsSection: string | undefined;
	readonly showApiKeysItem: boolean;
	readonly isPersonalModelOverridesEnabled: boolean;
	readonly isAdmin: boolean;
	readonly location: Location;
	readonly onCollapse?: () => void;
}

export const SettingsPanel: FC<SettingsPanelProps> = ({
	isSettingsPanel,
	settingsPanel,
	settingsSection,
	showApiKeysItem,
	isPersonalModelOverridesEnabled,
	isAdmin,
	location,
	onCollapse,
}) => {
	const subNavTitle =
		settingsPanel === "settings-admin" ? "管理智能体" : "设置";

	return (
		<div
			className={cn(
				"absolute inset-0 flex flex-col sm:transition-transform sm:duration-200 sm:ease-in-out",
				!isSettingsPanel && "translate-x-full",
			)}
			aria-hidden={!isSettingsPanel}
			inert={!isSettingsPanel ? true : undefined}
		>
			<div className="border-b border-border-default px-2 pb-2 pt-3 sm:py-2">
				<div className="relative flex items-center">
					<span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-content-primary">
						{subNavTitle}
					</span>
					<Button
						asChild
						variant="subtle"
						size="icon"
						aria-label={
							settingsPanel === "settings-admin"
								? "返回设置"
								: "返回智能体"
						}
						className="relative z-10 size-7 min-w-0 text-content-secondary hover:text-content-primary"
					>
						{settingsPanel === "settings-admin" ? (
							<Link
								to="/agents/settings/general"
								state={location.state}
								aria-label="返回设置"
							>
								<ArrowLeftIcon />
							</Link>
						) : (
							<Link
								to={(location.state as { from?: string })?.from || "/agents"}
							>
								<ArrowLeftIcon />
							</Link>
						)}
					</Button>
					<div className="flex-1" />
					{onCollapse && (
						<Button
							variant="subtle"
							size="icon"
							onClick={onCollapse}
							aria-label="收起侧边栏"
							className="relative z-10 hidden size-7 min-w-0 text-content-secondary hover:text-content-primary sm:inline-flex"
						>
							<PanelLeftCloseIcon />
						</Button>
					)}
				</div>
			</div>
			{settingsPanel === "settings" ? (
				<nav className="flex flex-col gap-0.5 px-2 py-2">
					<SettingsNavItem
						icon={UserIcon}
						label="常规"
						active={!settingsSection || settingsSection === "general"}
						to="/agents/settings/general"
						state={location.state}
					/>
					{isPersonalModelOverridesEnabled && (
						<SettingsNavItem
							icon={BotIcon}
							label="智能体"
							active={settingsSection === "user-agents"}
							to="/agents/settings/user-agents"
							state={location.state}
						/>
					)}
					<SettingsNavItem
						icon={ReceiptTextIcon}
						label="个人技能"
						active={settingsSection === "personal-skills"}
						to="/agents/settings/personal-skills"
						state={location.state}
					/>
					<SettingsNavItem
						icon={ShrinkIcon}
						label="压缩"
						active={settingsSection === "compaction"}
						to="/agents/settings/compaction"
						state={location.state}
					/>
					{showApiKeysItem && (
						<SettingsNavItem
							icon={KeyIcon}
							label="密钥 (API 密钥)"
							active={settingsSection === "api-keys"}
							to="/agents/settings/api-keys"
							state={location.state}
						/>
					)}
					{isAdmin && (
						<SettingsNavItem
							icon={Settings2Icon}
							label="管理智能体"
							active={false}
							to="/agents/settings/admin"
							state={location.state}
							trailingIcon={ChevronRightIcon}
						/>
					)}
				</nav>
			) : (
				<nav className="flex flex-col gap-0.5 px-2 py-2">
					<SettingsNavItem
						icon={BotIcon}
						label="智能体"
						active={!settingsSection || settingsSection === "agents"}
						to="/agents/settings/agents"
						state={location.state}
					/>
					<SettingsNavItem
						icon={PlugIcon}
						label="提供商"
						active={false}
						to="/ai/settings"
						trailingIcon={ArrowUpRightIcon}
					/>
					<SettingsNavItem
						icon={BoxesIcon}
						label="模型"
						active={settingsSection === "models"}
						to="/agents/settings/models"
						state={location.state}
					/>
					<SettingsNavItem
						icon={ServerIcon}
						label="MCP 服务器"
						active={settingsSection === "mcp-servers"}
						to="/agents/settings/mcp-servers"
						state={location.state}
					/>
					<SettingsNavItem
						icon={LayoutTemplateIcon}
						label="模板"
						active={settingsSection === "templates"}
						to="/agents/settings/templates"
						state={location.state}
					/>
					<SettingsNavItem
						icon={CoinsIcon}
						label="费用"
						active={settingsSection === "spend"}
						to="/agents/settings/spend"
						state={location.state}
					/>
					<SettingsNavItem
						icon={ReceiptTextIcon}
						label="指令"
						active={settingsSection === "instructions"}
						to="/agents/settings/instructions"
						state={location.state}
					/>
					<SettingsNavItem
						icon={FlaskConicalIcon}
						label="实验"
						active={settingsSection === "experiments"}
						to="/agents/settings/experiments"
						state={location.state}
					/>
					<SettingsNavItem
						icon={RefreshCwIcon}
						label="生命周期"
						active={settingsSection === "lifecycle"}
						to="/agents/settings/lifecycle"
						state={location.state}
					/>
				</nav>
			)}
		</div>
	);
};
