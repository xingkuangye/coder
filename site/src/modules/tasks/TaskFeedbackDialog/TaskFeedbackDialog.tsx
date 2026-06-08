import { useFormik } from "formik";
import { FrownIcon, MehIcon, SmileIcon } from "lucide-react";
import type { FC, HTMLProps, ReactNode } from "react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import {
	API,
	type CreateTaskFeedbackRequest,
	type TaskFeedbackRating,
} from "#/api/api";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
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
import type { DialogProps } from "#/components/Dialogs/Dialog";
import { Spinner } from "#/components/Spinner/Spinner";
import { Textarea } from "#/components/Textarea/Textarea";

type TaskFeedbackFormValues = {
	rate: TaskFeedbackRating | null;
	comment: string;
};

type TaskFeedbackDialogProps = DialogProps & {
	taskId: string;
};

export const TaskFeedbackDialog: FC<TaskFeedbackDialogProps> = ({
	taskId,
	...dialogProps
}) => {
	const {
		mutate: createFeedback,
		error,
		isPending,
	} = useMutation({
		mutationFn: (req: CreateTaskFeedbackRequest) =>
			API.createTaskFeedback(taskId, req),
		onSuccess: () => {
			toast.success("反馈提交成功。");
		},
	});

	const formik = useFormik<TaskFeedbackFormValues>({
		initialValues: {
			rate: null,
			comment: "",
		},
		onSubmit: (values) => {
			if (values.rate !== null) {
				createFeedback({
					rate: values.rate,
					comment: values.comment,
				});
			}
		},
	});

	const isRateSelected = Boolean(formik.values.rate);

	return (
		<Dialog {...dialogProps}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>任务反馈</DialogTitle>
					<DialogDescription>
						您的反馈对我们很重要。请评价您对此任务的体验。
					</DialogDescription>
				</DialogHeader>

				<form
					id="feedback-form"
					onSubmit={formik.handleSubmit}
					className="flex flex-col gap-4"
				>
					{error && <ErrorAlert error={error} />}

					<fieldset className="flex flex-col gap-1">
						<legend className="sr-only">评价您的体验</legend>
						<RateOption {...formik.getFieldProps("rate")} value="good">
							<SmileIcon />我达到了目标
						</RateOption>
						<RateOption {...formik.getFieldProps("rate")} value="okay">
							<MehIcon />
							它基本完成了，但遇到了很多困难
						</RateOption>
						<RateOption {...formik.getFieldProps("rate")} value="bad">
							<FrownIcon />
							完全失败
						</RateOption>
					</fieldset>

					<label className="sr-only" htmlFor="comment">
						补充说明
					</label>
					<Textarea
						id="comment"
						placeholder="还有什么想说的吗？..."
						className="h-32 resize-none"
						{...formik.getFieldProps("comment")}
					/>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">关闭</Button>
					</DialogClose>
					<Button
						type="submit"
						form="feedback-form"
						disabled={!isRateSelected || isPending}
					>
						<Spinner loading={isPending} />
						提交反馈
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

type RateOptionProps = HTMLProps<HTMLInputElement> & {
	children: ReactNode;
};

const RateOption: FC<RateOptionProps> = ({ children, ...inputProps }) => {
	return (
		<label
			className={`
			cursor-pointer border border-border border-solid hover:bg-surface-secondary
			px-4 py-3 rounded text-sm has-[:checked]:bg-surface-quaternary
			flex items-center gap-3 [&_svg]:size-4
		`}
		>
			<input className="hidden" type="radio" {...inputProps} />
			{children}
		</label>
	);
};
