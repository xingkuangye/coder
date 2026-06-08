import type { FC, ReactNode } from "react";
import { Link } from "react-router";

interface AgentSetupNoticeProps {
	isAdmin: boolean;
	providerCount: number;
	modelCount: number;
}

export const AgentSetupNotice: FC<AgentSetupNoticeProps> = ({
	isAdmin,
	providerCount,
	modelCount,
}) => {
	const hasProvider = providerCount > 0;
	const hasModel = modelCount > 0;

	if (hasProvider && hasModel) {
		return null;
	}

	// Non-admin member: show a generic message
	if (!isAdmin) {
		return (
			<NoticeContainer>
				AI 模型尚不可用。您的管理员仍在进行设置。
			</NoticeContainer>
		);
	}

	// Admin: missing provider (with or without models)
	if (!hasProvider) {
		return (
			<NoticeContainer>
				要与 Coder Agents 聊天，请设置一个{" "}
				<Link
					to="/ai/settings"
					className="text-content-link transition-colors hover:text-content-link/80"
				>
					提供商
				</Link>
				{!hasModel && (
					<>
						{" "}
						，然后添加一个{" "}
						<Link
							to="/agents/settings/models"
							className="text-content-link transition-colors hover:text-content-link/80"
						>
							模型
						</Link>
					</>
				)}
				。
			</NoticeContainer>
		);
	}

	// Admin: has providers but no models
	return (
		<NoticeContainer>
			要与 Coder Agents 聊天，请设置一个{" "}
			<Link
				to="/agents/settings/models"
				className="text-content-link transition-colors hover:text-content-link/80"
			>
				模型
			</Link>
			。
		</NoticeContainer>
	);
};

const NoticeContainer: FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<div className="rounded-2xl bg-surface-tertiary px-4 pb-14 pt-2.5 text-[13px] text-content-primary">
			{children}
		</div>
	);
};
