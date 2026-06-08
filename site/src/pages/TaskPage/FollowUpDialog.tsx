import { useFormik } from "formik";
import type { FC } from "react";
import { useId } from "react";
import type { Task } from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { Textarea } from "#/components/Textarea/Textarea";

type FollowUpDialogProps = {
	task: Task;
	initialMessage: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (message: string) => void;
};

export const FollowUpDialog: FC<FollowUpDialogProps> = ({
	task,
	initialMessage,
	open,
	onOpenChange,
	onSubmit,
}) => {
	const formId = useId();

	const formik = useFormik({
		initialValues: {
			message: initialMessage,
		},
		enableReinitialize: true,
		onSubmit: (values) => {
			const message = values.message.trim();
			if (message.length === 0) {
				return;
			}
			onSubmit(message);
			onOpenChange(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>发送跟进消息</DialogTitle>
					<DialogDescription>
						为此任务添加另一条消息。任务将恢复并自动发送此跟进消息。
					</DialogDescription>
				</DialogHeader>

				<form id={formId} className="space-y-4" onSubmit={formik.handleSubmit}>
					<div>
						<label
							htmlFor={`${formId}-message`}
							className="block text-sm font-medium text-content-primary mb-2"
						>
							跟进消息
						</label>
						<Textarea
							id={`${formId}-message`}
							name="message"
							value={formik.values.message}
							onChange={formik.handleChange}
							rows={10}
							className="w-full"
							placeholder={`在恢复后继续"${task.display_name}"，询问下一步...`}
						/>
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">取消</Button>
					</DialogClose>
					<Button
						type="submit"
						form={formId}
						disabled={formik.values.message.trim().length === 0}
					>
						发送跟进
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
