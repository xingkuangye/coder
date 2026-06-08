import type { FC } from "react";
import type { WorkspaceResource } from "#/api/typesGenerated";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Link } from "#/components/Link/Link";
import { useProxy } from "#/contexts/ProxyContext";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { docs } from "#/utils/docs";

interface WildcardHostnameWarningProps {
	// If resources are provided, show template-focused warning
	resources?: WorkspaceResource[];
}

export const WildcardHostnameWarning: FC<WildcardHostnameWarningProps> = ({
	resources,
}) => {
	const { proxy } = useProxy();
	const { permissions } = useAuthenticated();

	const hasResources = Boolean(resources);
	const canEditDeploymentConfig = Boolean(permissions.editDeploymentConfig);

	if (proxy.proxy?.wildcard_hostname) {
		return null;
	}

	if (hasResources) {
		const hasSubdomainCoderApp = resources!.some((resource) => {
			return resource.agents?.some((agent) =>
				agent.apps?.some((app) => app.subdomain),
			);
		});

		if (!hasSubdomainCoderApp) {
			return null;
		}
	}

	return (
		<Alert
			severity="warning"
			prominent
			className={
				hasResources
					? "rounded-none border-0 border-l-2 border-l-warning border-b-divider"
					: undefined
			}
		>
			<AlertTitle>部分工作空间应用将无法正常工作</AlertTitle>
			<AlertDescription>
				<div>
					{hasResources
						? "此模板包含配置了"
						: "此工作空间中的一个或多个应用具有"}{" "}
					<code className="py-px px-1 bg-surface-tertiary rounded-sm text-content-primary">
						subdomain = true
					</code>
					{canEditDeploymentConfig ? (
						<>
							，但子域应用尚未配置。在启动 Coder 服务器时配置{" "}
							<code className="py-px px-1 bg-surface-tertiary rounded-sm text-content-primary">
								--wildcard-access-url
							</code>{" "}
							标志之前，用户将无法访问这些应用。
						</>
					) : (
						"，这需要 Coder 部署配置了通配符访问 URL。请联系您的管理员。"
					)}
				</div>
				<div className="pt-2">
					<Link
						href={docs("/admin/networking/wildcard-access-url")}
						target="_blank"
					>
						<span className="font-semibold">
							了解通配符访问 URL 更多信息
						</span>
					</Link>
				</div>
			</AlertDescription>
		</Alert>
	);
};
