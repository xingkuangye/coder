import type { FC } from "react";
import { useNavigate } from "react-router";
import type { TemplateVersionParameter } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";

interface EphemeralParametersDialogProps {
	open: boolean;
	onClose: () => void;
	onContinue: () => void;
	ephemeralParameters: TemplateVersionParameter[];
	workspaceOwner: string;
	workspaceName: string;
	templateVersionId: string;
}

export const EphemeralParametersDialog: FC<EphemeralParametersDialogProps> = ({
	open,
	onClose,
	onContinue,
	ephemeralParameters,
	workspaceOwner,
	workspaceName,
	templateVersionId,
}) => {
	const navigate = useNavigate();

	const handleGoToParameters = () => {
		onClose();
		navigate(
			`/@${workspaceOwner}/${workspaceName}/settings/parameters?templateVersionId=${templateVersionId}`,
		);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>检测到临时参数</DialogTitle>
					<DialogDescription>
						此工作空间模板有{" "}
						<strong className="text-content-primary">
							{ephemeralParameters.length}
						</strong>{" "}
						个临时参数，它们将被重置为默认值
					</DialogDescription>
					<DialogDescription>
						<ul className="list-none pl-6 space-y-2">
							{ephemeralParameters.map((param) => (
								<li key={param.name}>
									<p className="text-content-primary m-0 font-bold">
										{param.display_name || param.name}
									</p>
									{param.description && (
										<p className="m-0 text-sm text-content-secondary">
											{param.description}
										</p>
									)}
								</li>
							))}
						</ul>
					</DialogDescription>
					<DialogDescription>
						是否要转到工作空间参数页面，在继续之前查看和更新这些参数？
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={onContinue} variant="outline">
						继续
					</Button>
					<Button
						data-testid="workspace-parameters"
						onClick={handleGoToParameters}
					>
						转到工作空间参数
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
