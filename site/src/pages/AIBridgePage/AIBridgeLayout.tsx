import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router";
import { Margins } from "#/components/Margins/Margins";
import {
	PageHeader,
	PageHeaderSubtitle,
	PageHeaderTitle,
} from "#/components/PageHeader/PageHeader";
import { AIBridgeHelpPopover } from "./AIBridgeHelpPopover";

const AIBridgeLayout: FC<PropsWithChildren> = () => {
	return (
		<Margins className="pb-12">
			<PageHeader>
				<PageHeaderTitle>
					<div className="flex items-center gap-2">
						<span>AI Bridge 日志</span>
						<AIBridgeHelpPopover />
					</div>
				</PageHeaderTitle>
				<PageHeaderSubtitle>
					集中审计您组织中的LLM使用情况。
				</PageHeaderSubtitle>
			</PageHeader>
			<Outlet />
		</Margins>
	);
};

export default AIBridgeLayout;
