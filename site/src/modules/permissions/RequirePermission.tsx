import type { FC, ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { Link } from "#/components/Link/Link";

interface RequirePermissionProps {
	children?: ReactNode;
	isFeatureVisible: boolean;
}

/**
 * 包装基于 RBAC 或许可证可用的路由。
 */
export const RequirePermission: FC<RequirePermissionProps> = ({
	children,
	isFeatureVisible,
}) => {
	if (!isFeatureVisible) {
		return (
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							您没有权限查看此页面
						</DialogTitle>
					</DialogHeader>
					<DialogDescription>
						如果您认为这是错误，请联系您的管理员或尝试使用其他凭据登录。
					</DialogDescription>
					<DialogFooter>
						<Link href="/">前往工作区</Link>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return <>{children}</>;
};
