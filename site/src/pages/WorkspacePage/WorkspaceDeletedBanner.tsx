import type { FC } from "react";
import { Link as RouterLink } from "react-router";
import { Alert } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";

interface WorkspaceDeletedBannerProps {
	createWorkspaceLink: string;
	templateName: string;
}

export const WorkspaceDeletedBanner: FC<WorkspaceDeletedBannerProps> = ({
	createWorkspaceLink,
	templateName,
}) => {
	const createWorkspaceButton = (
		<Button asChild size="sm">
			<RouterLink to={createWorkspaceLink}>
				从 {templateName} 创建另一个
			</RouterLink>
		</Button>
	);

	return (
		<Alert severity="warning" prominent actions={createWorkspaceButton}>
			此工作区已被删除。
		</Alert>
	);
};
