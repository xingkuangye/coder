import type { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import { Link } from "#/components/Link/Link";
import { docs } from "#/utils/docs";

export const ChatAccessDeniedAlert: FC = () => {
	const docsLink = docs(
		"/ai-coder/agents/getting-started#step-3-grant-coder-agents-user",
	);

	return (
		<Alert
			severity="info"
			actions={
				<Button size="sm" onClick={() => location.reload()}>
					刷新
				</Button>
			}
		>
			<AlertTitle>需要访问权限</AlertTitle>
			<AlertDescription>
				您没有使用 Coder Agents 的权限。请联系您的 Coder 管理员获取访问权限。获得访问权限后刷新此页面。{" "}
				<Link href={docsLink} target="_blank" rel="noreferrer">
					查看文档
				</Link>
			</AlertDescription>
		</Alert>
	);
};
