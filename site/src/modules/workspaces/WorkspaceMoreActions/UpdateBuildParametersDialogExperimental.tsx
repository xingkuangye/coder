import type { FC } from "react";
import { useNavigate } from "react-router";
import type { FieldError } from "#/api/errors";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";

type UpdateBuildParametersDialogExperimentalProps = {
	open: boolean;
	onClose: () => void;
	validations: FieldError[];
	workspaceOwnerName: string;
	workspaceName: string;
	templateVersionId: string | undefined;
};

export const UpdateBuildParametersDialogExperimental: FC<
	UpdateBuildParametersDialogExperimentalProps
> = ({
	validations,
	open,
	onClose,
	workspaceOwnerName,
	workspaceName,
	templateVersionId,
}) => {
	const navigate = useNavigate();

	const handleGoToParameters = () => {
		onClose();
		navigate(
			`/@${workspaceOwnerName}/${workspaceName}/settings/parameters?templateVersionId=${templateVersionId}`,
		);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>更新工作区参数</DialogTitle>
					<DialogDescription>
						此模板有{" "}
						<strong className="text-content-primary">
							{validations.length} 个参数{validations.length === 1 ? "" : ""}
						</strong>{" "}
						必须配置才能完成更新。
					</DialogDescription>
					<DialogDescription>
						您是否要前往工作区参数页面，在继续之前查看并更新这些参数？
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={onClose} variant="outline">
						取消
					</Button>
					<Button onClick={handleGoToParameters}>
						前往工作区参数
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
