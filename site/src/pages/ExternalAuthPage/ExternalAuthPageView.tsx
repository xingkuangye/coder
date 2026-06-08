import Link from "@mui/material/Link";
import { ExternalLinkIcon, RotateCwIcon } from "lucide-react";
import type { FC, ReactNode } from "react";
import type { ApiErrorResponse } from "#/api/errors";
import type { ExternalAuth, ExternalAuthDevice } from "#/api/typesGenerated";
import { Alert } from "#/components/Alert/Alert";
import { Avatar } from "#/components/Avatar/Avatar";
import { GitDeviceAuth } from "#/components/GitDeviceAuth/GitDeviceAuth";
import { SignInLayout } from "#/components/SignInLayout/SignInLayout";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/Tooltip/Tooltip";
import { Welcome } from "#/components/Welcome/Welcome";

interface ExternalAuthPageViewProps {
	externalAuth: ExternalAuth;
	viewExternalAuthConfig: boolean;

	externalAuthDevice?: ExternalAuthDevice;
	deviceExchangeError?: ApiErrorResponse;

	onReauthenticate: () => void;
}

const ExternalAuthPageView: FC<ExternalAuthPageViewProps> = ({
	deviceExchangeError,
	externalAuth,
	externalAuthDevice,
	onReauthenticate,
	viewExternalAuthConfig,
}) => {
	if (!externalAuth.authenticated) {
		return (
			<SignInLayout>
				<Welcome>使用 {externalAuth.display_name} 进行身份验证</Welcome>

				{externalAuth.device && (
					<GitDeviceAuth
						deviceExchangeError={deviceExchangeError}
						externalAuthDevice={externalAuthDevice}
					/>
				)}
			</SignInLayout>
		);
	}

	const hasInstallations = externalAuth.installations.length > 0;

	// We only want to wrap this with a link if an install URL is available!
	let installTheApp: ReactNode = `安装 ${externalAuth.display_name} App`;
	if (externalAuth.app_install_url) {
		installTheApp = (
			<Link
				href={externalAuth.app_install_url}
				target="_blank"
				rel="noreferrer"
			>
				{installTheApp}
			</Link>
		);
	}

	return (
		<SignInLayout>
			<Welcome>
				您已使用 {externalAuth.display_name} 完成身份验证！
			</Welcome>

			<p className="m-0 text-center text-base leading-relaxed text-content-secondary">
				{externalAuth.user?.login && `嗨 @${externalAuth.user?.login}! 👋`}
				{(!externalAuth.app_installable ||
					externalAuth.installations.length > 0) &&
					"您现已通过身份验证，可以关闭此窗口了！"}
			</p>

			{externalAuth.installations.length > 0 && (
				<div className="m-8 flex items-center gap-1 text-content-disabled">
					{externalAuth.installations.map((install) => {
						if (!install.account) {
							return;
						}
						return (
							<Tooltip key={install.id}>
								<TooltipTrigger asChild>
									<Link
										href={install.account.profile_url}
										target="_blank"
										rel="noreferrer"
									>
										<Avatar
											src={install.account.avatar_url}
											fallback={install.account.login}
										/>
									</Link>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									{install.account.login}
								</TooltipContent>
							</Tooltip>
						);
					})}
					&nbsp;
					{externalAuth.installations.length} 个组织
					{externalAuth.installations.length !== 1 && ""}已授权
				</div>
			)}

			<div className="m-4 flex flex-col gap-1">
				{!hasInstallations && externalAuth.app_installable && (
					<Alert severity="warning" className="m-4">
						您必须先 {installTheApp} 才能克隆私有仓库。授权完成后，账户将显示在此处。
					</Alert>
				)}

				{viewExternalAuthConfig &&
					externalAuth.app_install_url &&
					externalAuth.app_installable && (
						<Link
							href={externalAuth.app_install_url}
							target="_blank"
							rel="noreferrer"
							className="flex items-center justify-center gap-2 text-base"
						>
							<ExternalLinkIcon className="size-icon-xs" />
							{externalAuth.installations.length > 0 ? "配置" : "安装"}{" "}
							{externalAuth.display_name} 应用
						</Link>
					)}
				<Link
					className="flex items-center justify-center gap-2 text-base"
					href="#"
					onClick={() => {
						onReauthenticate();
					}}
				>
					<RotateCwIcon className="size-icon-xs" /> 重新验证
				</Link>
			</div>
		</SignInLayout>
	);
};

export default ExternalAuthPageView;
