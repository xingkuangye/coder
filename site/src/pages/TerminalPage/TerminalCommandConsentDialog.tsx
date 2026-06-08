import { TriangleAlertIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";

interface TerminalCommandConsentDialogProps {
	open: boolean;
	command: string;
	onConfirm: () => void;
	onDeny: () => void;
}

export const TerminalCommandConsentDialog: FC<
	TerminalCommandConsentDialogProps
> = ({ open, command, onConfirm, onDeny }) => {
	return (
		<Dialog open={open}>
			<DialogContent
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				className="max-w-2xl overflow-hidden min-w-0"
			>
				<DialogHeader>
					<DialogTitle>
						<TriangleAlertIcon className="size-icon-lg text-content-warning inline-block align-text-bottom mr-2" />
						警告：终端命令执行
					</DialogTitle>
					<DialogDescription>
						有链接请求在您的终端中运行命令。运行来自不可信来源的命令可能很危险。
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-w-0 flex-col gap-2">
					<span className="text-sm font-semibold text-content-primary">
						命令：
					</span>
					<code className="block whitespace-pre overflow-x-auto">
						{command}
					</code>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onDeny}>
						取消
					</Button>
					<Button variant="default" onClick={onConfirm}>
						运行命令
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
