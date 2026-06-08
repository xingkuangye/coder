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
import type { AutofillBuildParameter } from "#/utils/richParameters";

interface AutoCreateConsentDialogProps {
	open: boolean;
	autofillParameters: AutofillBuildParameter[];
	presetName?: string;
	onConfirm: () => void;
	onDeny: () => void;
}

export const AutoCreateConsentDialog: FC<AutoCreateConsentDialogProps> = ({
	open,
	autofillParameters,
	presetName,
	onConfirm,
	onDeny,
}) => {
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
						警告：自动创建工作区
					</DialogTitle>
					<DialogDescription>
						某个链接正尝试使用以下外部配置自动创建工作区。运行来自不受信任来源的脚本可能存在风险。
					</DialogDescription>
				</DialogHeader>

				{presetName && (
					<div className="flex min-w-0 flex-col gap-2">
						<span className="text-sm font-semibold text-content-primary">
							预设：
						</span>
						<code className="block whitespace-pre overflow-x-auto">
							{presetName}
						</code>
					</div>
				)}

				{autofillParameters.length > 0 && (
					<div className="flex min-w-0 flex-col gap-2">
						<span className="text-sm font-semibold text-content-primary">
							参数：
						</span>
						<code className="block whitespace-pre overflow-x-auto">
							{autofillParameters
								.map((p) => `${p.name}: ${p.value}`)
								.join("\n")}
						</code>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onDeny}>
						取消
					</Button>
					<Button variant="default" onClick={onConfirm}>
						确认并创建
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
