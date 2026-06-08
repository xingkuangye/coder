import type { FC } from "react";
import { useNavigate } from "react-router";
import { getErrorDetail, getErrorMessage, isApiError } from "#/api/errors";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";

interface WorkspaceErrorDialogProps {
	open: boolean;
	error?: unknown;
	onClose: () => void;
	showDetail: boolean;
	workspaceOwner: string;
	workspaceName: string;
	templateVersionId: string;
	isDeleting: boolean;
}

export const WorkspaceErrorDialog: FC<WorkspaceErrorDialogProps> = ({
	open,
	error,
	onClose,
	showDetail,
	workspaceOwner,
	workspaceName,
	templateVersionId,
	isDeleting,
}) => {
	const navigate = useNavigate();

	if (!error) {
		return null;
	}

	const handleGoToParameters = () => {
		onClose();
		navigate(
			`/@${workspaceOwner}/${workspaceName}/settings/parameters?templateVersionId=${templateVersionId}`,
		);
	};

	const errorDetail = getErrorDetail(error);
	const validations = isApiError(error)
		? error.response.data.validations
		: undefined;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent variant="destructive">
				<DialogHeader>
					<DialogTitle>
						错误{isDeleting ? "删除" : "构建"}工作区
					</DialogTitle>
					<DialogDescription className="flex flex-row gap-4">
						<strong className="text-content-primary">信息</strong>{" "}
						<span>{getErrorMessage(error, "构建工作区失败。")}</span>
					</DialogDescription>
					{errorDetail && showDetail && (
						<DialogDescription className="flex flex-row gap-9">
							<strong className="text-content-primary">详情</strong>{" "}
							<span>{errorDetail}</span>
						</DialogDescription>
					)}
					{validations && (
						<DialogDescription className="flex flex-row gap-4">
							<strong className="text-content-primary">验证结果</strong>{" "}
							<span>
								{validations.map((validation) => validation.detail).join(", ")}
							</span>
						</DialogDescription>
					)}
				</DialogHeader>
				<DialogFooter>
					<Button onClick={handleGoToParameters}>
						查看工作区设置
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
