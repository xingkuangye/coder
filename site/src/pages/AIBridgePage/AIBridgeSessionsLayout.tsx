import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router";
import { Link } from "#/components/Link/Link";
import { Margins } from "#/components/Margins/Margins";
import {
	PageHeader,
	PageHeaderSubtitle,
	PageHeaderTitle,
} from "#/components/PageHeader/PageHeader";
import { docs } from "#/utils/docs";

const AIBridgeSessionsLayout: FC<PropsWithChildren> = () => {
	return (
		<Margins className="pb-12">
			<PageHeader>
				<PageHeaderTitle>
					<div className="flex items-center gap-2">
						<span>AI 会话</span>
					</div>
				</PageHeaderTitle>
				<PageHeaderSubtitle>
					查看并审计跨会话的 AI 活动、token 使用与提示历史。{" "}
					<Link
						href={docs("/ai-coder/ai-bridge/audit")}
						className="ml-auto"
						target="_blank"
					>
						了解如何审计 AI 会话
					</Link>
				</PageHeaderSubtitle>
			</PageHeader>
			<Outlet />
		</Margins>
	);
};

export default AIBridgeSessionsLayout;
