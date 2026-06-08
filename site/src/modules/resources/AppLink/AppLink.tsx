import {
	Building2Icon,
	CircleAlertIcon,
	GlobeIcon,
	type LucideIcon,
	SquareArrowOutUpRightIcon,
	UsersIcon,
} from "lucide-react";
import { type FC, type ReactNode, useState } from "react";
import type * as TypesGen from "#/api/typesGenerated";
import { DropdownMenuItem } from "#/components/DropdownMenu/DropdownMenu";
import { Link } from "#/components/Link/Link";
import { Markdown } from "#/components/Markdown/Markdown";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { useProxy } from "#/contexts/ProxyContext";
import { isExternalApp, needsSessionToken } from "#/modules/apps/apps";
import { useAppLink } from "#/modules/apps/useAppLink";
import { docs } from "#/utils/docs";
import { AgentButton } from "../AgentButton";
import { BaseIcon } from "./BaseIcon";

export const DisplayAppNameMap: Record<TypesGen.DisplayApp, string> = {
	port_forwarding_helper: "端口",
	ssh_helper: "SSH",
	vscode: "VS Code Desktop",
	vscode_insiders: "VS Code Insiders",
	web_terminal: "终端",
};

interface AppLinkProps {
	workspace: TypesGen.Workspace;
	app: TypesGen.WorkspaceApp;
	agent: TypesGen.WorkspaceAgent;
	grouped?: boolean;
}

export const AppLink: FC<AppLinkProps> = ({
	app,
	workspace,
	agent,
	grouped,
}) => {
	const { proxy } = useProxy();
	const host = proxy.preferredWildcardHostname;
	const [iconError, setIconError] = useState(false);
	const link = useAppLink(app, { agent, workspace });

	// canClick is ONLY false when it's a subdomain app and the admin hasn't
	// enabled wildcard access URL or the session token is being fetched.
	//
	// To avoid bugs in the healthcheck code locking users out of apps, we no
	// longer block access to apps if they are unhealthy/initializing.
	let canClick = true;
	let primaryTooltip: ReactNode = "";
	let icon = !iconError && (
		<BaseIcon app={app} onIconPathError={() => setIconError(true)} />
	);

	if (app.health === "initializing") {
		icon = <Spinner loading />;
		primaryTooltip = "初始化中...";
	}

	if (app.health === "unhealthy") {
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-warning"
			/>
		);
		primaryTooltip = "异常";
	}

	if (!host && app.subdomain) {
		canClick = false;
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-secondary"
			/>
		);
		primaryTooltip =
			"管理员尚未配置子域应用访问";
	}

	if (app.subdomain_name && app.subdomain_name.length > 63) {
		icon = (
			<CircleAlertIcon
				aria-hidden="true"
				className="size-icon-sm text-content-warning"
			/>
		);
		primaryTooltip = (
			<>
				由于主机名过长，端口转发将无法工作，请参阅{" "}
				<Link
					href={docs("/user-guides/workspace-access/port-forwarding#dashboard")}
					target="_blank"
					size="sm"
				>
					文档
				</Link>{" "}
				了解更多详情
			</>
		);
	}

	if (isExternalApp(app) && needsSessionToken(app) && !link.hasToken) {
		canClick = false;
	}

	if (
		agent.lifecycle_state === "starting" &&
		agent.startup_script_behavior === "blocking"
	) {
		canClick = false;
	}

	const canShare = app.sharing_level !== "owner";
	const { shareTooltip, shareIcon: ShareIcon } = canShare
		? app.external
			? {
					shareTooltip: "打开外部链接",
					shareIcon: SquareArrowOutUpRightIcon,
				}
			: shareDetails[app.sharing_level]
		: {
				shareTooltip: null,
				shareIcon: null,
			};

	const button = grouped ? (
		<DropdownMenuItem asChild>
			<a
				href={canClick ? link.href : undefined}
				onClick={link.onClick}
				target={app.open_in === "tab" ? "_blank" : undefined}
				rel={app.open_in === "tab" ? "noreferrer" : undefined}
			>
				{icon}
				{link.label}
				{ShareIcon && <ShareIcon />}
			</a>
		</DropdownMenuItem>
	) : (
		<AgentButton asChild>
			<a
				href={canClick ? link.href : undefined}
				onClick={link.onClick}
				target={app.open_in === "tab" ? "_blank" : undefined}
				rel={app.open_in === "tab" ? "noreferrer" : undefined}
			>
				{icon}
				{link.label}
				{ShareIcon && <ShareIcon />}
			</a>
		</AgentButton>
	);

	if (primaryTooltip || app.tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent className="max-w-xs">
					{primaryTooltip ? (
						primaryTooltip
					) : app.tooltip ? (
						<Markdown className="text-content-secondary prose-sm font-medium wrap-anywhere">
							{app.tooltip}
						</Markdown>
					) : null}
					{shareTooltip}
				</TooltipContent>
			</Tooltip>
		);
	}

	return button;
};

const shareDetails: {
	[SharingLevel in TypesGen.WorkspaceAppSharingLevel as Exclude<
		SharingLevel,
		"owner"
	>]: { shareTooltip: string; shareIcon: LucideIcon };
} = {
	authenticated: {
		shareTooltip: "对所有已认证用户共享",
		shareIcon: UsersIcon,
	},
	organization: {
		shareTooltip: "对组织成员共享",
		shareIcon: Building2Icon,
	},
	public: {
		shareTooltip: "公开共享",
		shareIcon: GlobeIcon,
	},
};
