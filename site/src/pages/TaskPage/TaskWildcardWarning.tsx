import { SquareArrowOutUpRightIcon } from "lucide-react";
import { Link as RouterLink } from "react-router";
import { Button } from "#/components/Button/Button";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { docs } from "#/utils/docs";

export const TaskWildcardWarning = () => {
	const { permissions } = useAuthenticated();

	return (
		<div className="text-center max-w-md">
			<h3 className="font-medium text-content-primary text-base mb-3">错误</h3>
			<div className="text-content-secondary text-sm flex flex-col gap-3 items-center">
				<div className="px-4">
					此应用程序已设置
					<code className="py-px px-1 bg-surface-tertiary rounded-sm text-content-primary">
						subdomain = true
					</code>
					{permissions.editDeploymentConfig ? (
						<>
							，但子域名应用程序未配置。在启动 Coder 服务器时，您需要配置
							<code className="py-px px-1 bg-surface-tertiary rounded-sm text-content-primary whitespace-nowrap">
								--wildcard-access-url
							</code>
							{" "}
							标志，否则此应用程序将无法访问。
						</>
					) : (
						"，这需要配置了通配符访问 URL 的 Coder 部署。请联系您的管理员。"
					)}
				</div>
				<Button size="sm" variant="outline" asChild>
					<RouterLink to={docs("/admin/networking/wildcard-access-url")}>
						<SquareArrowOutUpRightIcon />
						了解更多关于通配符访问 URL 的信息
					</RouterLink>
				</Button>
			</div>
		</div>
	);
};
