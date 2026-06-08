import type { FC, ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import type { ConnectionLog } from "#/api/typesGenerated";
import { Link } from "#/components/Link/Link";
import { connectionTypeToFriendlyName } from "#/utils/connection";

interface ConnectionLogDescriptionProps {
	connectionLog: ConnectionLog;
}

export const ConnectionLogDescription: FC<ConnectionLogDescriptionProps> = ({
	connectionLog,
}) => {
	const { type, workspace_owner_username, workspace_name, web_info } =
		connectionLog;

	switch (type) {
		case "port_forwarding":
		case "workspace_app": {
			if (!web_info) return null;

			const { user, slug_or_port, status_code } = web_info;
			const isPortForward = type === "port_forwarding";
			const presentAction = isPortForward ? "访问" : "打开";
			const pastAction = isPortForward ? "已访问" : "已打开";

			const target: ReactNode = isPortForward ? (
				<>
					端口 <strong>{slug_or_port}</strong>
				</>
			) : (
				<strong>{slug_or_port}</strong>
			);

			const actionText: ReactNode = (() => {
				if (status_code === 303) {
					return (
						<>
							在尝试 {presentAction} {target} 时被重定向
						</>
					);
				}
				if ((status_code ?? 0) >= 400) {
					return (
						<>
							尝试 {presentAction} {target} 失败
						</>
					);
				}
				return (
					<>
						{pastAction} {target}
					</>
				);
			})();

			const isOwnWorkspace = user
				? workspace_owner_username === user.username
				: false;

			return (
				<span>
					{user ? user.username : "未认证用户"} {actionText} 在{" "}
					{isOwnWorkspace ? "自己的" : `${workspace_owner_username} 的`}{" "}
					<Link asChild showExternalIcon={false} className="text-base">
						<RouterLink to={`/@${workspace_owner_username}/${workspace_name}`}>
							<strong>{workspace_name}</strong>
						</RouterLink>
					</Link>{" "}
					工作区
				</span>
			);
		}

		case "reconnecting_pty":
		case "ssh":
		case "jetbrains":
		case "vscode": {
			const friendlyType = connectionTypeToFriendlyName(type);
			return (
				<span>
					{friendlyType} 会话到 {workspace_owner_username} 的{" "}
					<Link asChild showExternalIcon={false} className="text-base">
						<RouterLink to={`/@${workspace_owner_username}/${workspace_name}`}>
							<strong>{workspace_name}</strong>
						</RouterLink>
					</Link>{" "}
					工作区{" "}
				</span>
			);
		}
	}
};
