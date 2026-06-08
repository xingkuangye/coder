import type { FC } from "react";
import type { UserSkillMetadata } from "#/api/typesGenerated";
import { Alert, AlertDescription } from "#/components/Alert/Alert";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { EmptyState } from "#/components/EmptyState/EmptyState";
import { Loader } from "#/components/Loader/Loader";
import { Spinner } from "#/components/Spinner/Spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/Table/Table";
import { formatDate } from "#/utils/time";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import type { PersonalSkillErrorDisplay } from "./components/PersonalSkillEditor";
import { PersonalSkillEditor } from "./components/PersonalSkillEditor";
import { SectionHeader } from "./components/SectionHeader";
import {
	PERSONAL_SKILLS_MAX_PER_USER,
	type PersonalSkillFormValues,
} from "./utils/personalSkills";

export type PersonalSkillEditorState =
	| {
			mode: "create";
			initialValues: PersonalSkillFormValues;
			existingNames: readonly string[];
			submitError?: PersonalSkillErrorDisplay;
			isSubmitting: boolean;
			onSubmit: (values: PersonalSkillFormValues, content: string) => void;
			onClose: () => void;
	  }
	| {
			mode: "edit";
			initialValues?: PersonalSkillFormValues;
			existingNames: readonly string[];
			loadError?: unknown;
			isLoading: boolean;
			isRetrying: boolean;
			submitError?: PersonalSkillErrorDisplay;
			isSubmitting: boolean;
			onRetry: () => void;
			onSubmit: (values: PersonalSkillFormValues, content: string) => void;
			onClose: () => void;
	  };

export type PersonalSkillDeleteState = {
	skill: UserSkillMetadata;
	error?: PersonalSkillErrorDisplay;
	isDeleting: boolean;
	onConfirm: () => void;
	onClose: () => void;
};

export interface AgentSettingsPersonalSkillsPageViewProps {
	skills: readonly UserSkillMetadata[];
	error: unknown;
	isLoading: boolean;
	isRetrying: boolean;
	onRetry: () => void;
	onCreate: () => void;
	onEdit: (name: string) => void;
	onDelete: (skill: UserSkillMetadata) => void;
	editorState?: PersonalSkillEditorState;
	deleteState?: PersonalSkillDeleteState;
}

const formatUpdatedAt = (value: string) => {
	const date = new Date(value);
	if (!Number.isFinite(date.getTime())) {
		return "未知";
	}
	return formatDate(date, {
		locale: "en-US",
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		second: undefined,
		minute: "2-digit",
	});
};

const EditSkillDialog: FC<{
	state: Extract<PersonalSkillEditorState, { mode: "edit" }>;
}> = ({ state }) => {
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			state.onClose();
		}
	};

	if (state.isLoading) {
		return (
			<Dialog open onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>正在加载个人技能</DialogTitle>
						<DialogDescription>
							正在获取最新的 SKILL.md 内容。
						</DialogDescription>
					</DialogHeader>
					<Loader />
				</DialogContent>
			</Dialog>
		);
	}

	if (state.loadError || !state.initialValues) {
		return (
			<Dialog open onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>无法加载个人技能</DialogTitle>
						<DialogDescription>
							无法加载该技能以供编辑。
						</DialogDescription>
					</DialogHeader>
					{state.loadError ? (
						<ErrorAlert error={state.loadError} showDebugDetail={false} />
					) : (
						<Alert severity="error">
							<AlertDescription>
								保存的内容无法解析为 SKILL.md。
							</AlertDescription>
						</Alert>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={state.onClose}>
							关闭
						</Button>
						<Button onClick={state.onRetry} disabled={state.isRetrying}>
							{state.isRetrying && <Spinner className="h-4 w-4" loading />}
							重试
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<PersonalSkillEditor
			open
			mode="edit"
			initialValues={state.initialValues}
			existingNames={state.existingNames}
			submitError={state.submitError}
			isSubmitting={state.isSubmitting}
			onOpenChange={handleOpenChange}
			onSubmit={state.onSubmit}
		/>
	);
};

const DeleteSkillDialog: FC<{ state: PersonalSkillDeleteState }> = ({
	state,
}) => {
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			state.onClose();
		}
	};

	return (
		<ConfirmDeleteDialog
			open
			onOpenChange={handleOpenChange}
			entity="skill"
			description={
				<>
					删除 {state.skill.name}？代理将无法再使用此技能。此操作无法撤消。
				</>
			}
			onConfirm={state.onConfirm}
			isPending={state.isDeleting}
		>
			{state.error && (
				<Alert severity="error">
					<AlertDescription>
						{state.error.message}
						{state.error.detail ? ` ${state.error.detail}` : ""}
					</AlertDescription>
				</Alert>
			)}
		</ConfirmDeleteDialog>
	);
};

export const AgentSettingsPersonalSkillsPageView: FC<
	AgentSettingsPersonalSkillsPageViewProps
> = ({
	skills,
	error,
	isLoading,
	isRetrying,
	onRetry,
	onCreate,
	onEdit,
	onDelete,
	editorState,
	deleteState,
}) => {
	const isAtLimit = skills.length >= PERSONAL_SKILLS_MAX_PER_USER;
	const addSkillAction = (
		<Button size="sm" onClick={onCreate} disabled={isLoading || isAtLimit}>
			添加技能
		</Button>
	);

	return (
		<div className="flex flex-col gap-8">
			<SectionHeader
				label="个人技能"
				description="您的代理在需要专门指导时可选择的可重用指令。个人技能包含一个单独的 SKILL.md 文件。如需包含支持文件的更丰富的技能，请将它们添加到仓库的 `.agents/skills/` 目录下，或从工作区加载。"
				action={addSkillAction}
			/>

			{isAtLimit && (
				<Alert severity="warning">
					<AlertDescription>
						您已达到 {PERSONAL_SKILLS_MAX_PER_USER}{" "}
						个个人技能的上限。请先删除一个技能再创建新的。
					</AlertDescription>
				</Alert>
			)}

			{error ? (
				<div className="flex flex-col items-start gap-3">
					<ErrorAlert error={error} />
					<Button
						variant="outline"
						size="sm"
						onClick={onRetry}
						disabled={isRetrying}
					>
						{isRetrying && <Spinner className="h-4 w-4" loading />}
						重试
					</Button>
				</div>
			) : isLoading ? (
				<Loader />
			) : skills.length === 0 ? (
				<EmptyState
					message="暂无个人技能"
					description="创建个人技能以保存工作流程中可重用的代理指南。"
					cta={addSkillAction}
				/>
			) : (
				<Table aria-label="个人技能">
					<TableHeader>
						<TableRow>
							<TableHead>名称</TableHead>
							<TableHead>描述</TableHead>
							<TableHead>更新时间</TableHead>
							<TableHead className="text-right">操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{skills.map((skill) => (
							<TableRow key={skill.id}>
								<TableCell className="font-mono text-content-primary">
									{skill.name}
								</TableCell>
								<TableCell>
									{skill.description || (
										<span className="text-content-secondary">
											无描述
										</span>
									)}
								</TableCell>
								<TableCell>{formatUpdatedAt(skill.updated_at)}</TableCell>
								<TableCell>
									<div className="flex justify-end gap-2">
										<Button
											size="xs"
											variant="outline"
											onClick={() => onEdit(skill.name)}
										>
											编辑
										</Button>
										<Button
											size="xs"
											variant="destructive"
											onClick={() => onDelete(skill)}
										>
											删除
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			{editorState?.mode === "create" && (
				<PersonalSkillEditor
					open
					mode="create"
					initialValues={editorState.initialValues}
					existingNames={editorState.existingNames}
					submitError={editorState.submitError}
					isSubmitting={editorState.isSubmitting}
					onOpenChange={(open) => {
						if (!open) {
							editorState.onClose();
						}
					}}
					onSubmit={editorState.onSubmit}
				/>
			)}
			{editorState?.mode === "edit" && <EditSkillDialog state={editorState} />}
			{deleteState && <DeleteSkillDialog state={deleteState} />}
		</div>
	);
};
