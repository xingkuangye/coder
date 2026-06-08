import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ClockIcon, UserIcon } from "lucide-react";
import { type FC, type ReactNode, useState } from "react";
import type { Task } from "#/api/typesGenerated";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";

dayjs.extend(relativeTime);

type BatchDeleteConfirmationProps = {
	checkedTasks: readonly Task[];
	workspaceCount: number;
	open: boolean;
	isLoading: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export const BatchDeleteConfirmation: FC<BatchDeleteConfirmationProps> = ({
	checkedTasks,
	workspaceCount,
	open,
	onClose,
	onConfirm,
	isLoading,
}) => {
	const [stage, setStage] = useState<"consequences" | "tasks">("consequences");

	const onProceed = () => {
		switch (stage) {
			case "tasks":
				onConfirm();
				break;
			case "consequences":
				setStage("tasks");
				break;
		}
	};

	const taskCount = `${checkedTasks.length}个任务`;
	const workspaceCountText = `${workspaceCount}个工作区`;

	let confirmText: ReactNode = <>查看选定的任务&hellip;</>;
	if (stage === "tasks") {
		confirmText = (
			<>
				删除 {taskCount} 和 {workspaceCountText}
			</>
		);
	}

	return (
		<ConfirmDialog
			type="delete"
			open={open}
			onClose={() => {
				setStage("consequences");
				onClose();
			}}
			title={`删除 ${taskCount}`}
			confirmLoading={isLoading}
			confirmText={confirmText}
			onConfirm={onProceed}
			description={
				<>
					{stage === "consequences" && <Consequences />}
					{stage === "tasks" && <Tasks tasks={checkedTasks} />}
				</>
			}
		/>
	);
};

interface TasksStageProps {
	tasks: readonly Task[];
}

const Consequences: FC = () => {
	return (
		<>
			<p>删除任务是不可逆的！</p>
			<ul className="flex flex-col gap-2 pl-4 mb-0">
				<li>
					与工作区关联的任务会将对应的工作区一并删除。
				</li>
				<li>任务工作区中存储的所有数据将被永久删除。</li>
			</ul>
		</>
	);
};

const Tasks: FC<TasksStageProps> = ({ tasks }) => {
	const mostRecent = tasks.reduce(
		(latestSoFar, against) => {
			if (!latestSoFar) {
				return against;
			}

			return new Date(against.updated_at).getTime() >
				new Date(latestSoFar.updated_at).getTime()
				? against
				: latestSoFar;
		},
		undefined as Task | undefined,
	);

	const ownersCount = new Set(tasks.map((it) => it.owner_name)).size;
	const ownersCountDisplay = `${ownersCount}个所有者`;

	return (
		<>
			<ul className="list-none p-0 border border-solid border-border rounded-lg overflow-x-hidden overflow-y-auto max-h-48">
				{tasks.map((task) => (
					<li
						key={task.id}
						className="py-2 px-4 border-solid border-0 border-b border-border last:border-b-0"
					>
						<div className="flex items-center justify-between gap-6">
							<span className="font-medium text-content-primary max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap">
								{task.display_name}
							</span>

							<div className="flex flex-col text-sm items-end">
								<div className="flex items-center gap-2">
									<span className="whitespace-nowrap">{task.owner_name}</span>
									<UserIcon className="size-icon-sm -m-px" />
								</div>
								<div className="flex items-center gap-2">
									<span className="whitespace-nowrap">
										{dayjs(task.updated_at).fromNow()}
									</span>
									<ClockIcon className="size-icon-xs" />
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
			<div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm">
				<div className="flex items-center gap-2">
					<UserIcon className="size-icon-sm -m-px" />
					<span>{ownersCountDisplay}</span>
				</div>
				{mostRecent && (
					<div className="flex items-center gap-2">
						<ClockIcon className="size-icon-xs" />
						<span>最近更新 {dayjs(mostRecent.updated_at).fromNow()}</span>
					</div>
				)}
			</div>
		</>
	);
};
