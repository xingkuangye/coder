import { type FormikErrors, useFormik } from "formik";
import {
	type ChangeEvent,
	type ClipboardEvent,
	type FC,
	useId,
	useState,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import * as Yup from "yup";
import { Alert, AlertDescription, AlertTitle } from "#/components/Alert/Alert";
import { Button } from "#/components/Button/Button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/Dialog/Dialog";
import { Input } from "#/components/Input/Input";
import { Label } from "#/components/Label/Label";
import { Spinner } from "#/components/Spinner/Spinner";
import { cn } from "#/utils/cn";
import { formatKiB } from "#/utils/fileSize";
import {
	buildPersonalSkillMarkdown,
	getPersonalSkillContentSizeBytes,
	isValidPersonalSkillDescription,
	isValidPersonalSkillName,
	PERSONAL_SKILL_MAX_SIZE_BYTES,
	type PersonalSkillFormValues,
	tryParsePersonalSkillMarkdown,
} from "../utils/personalSkills";

export type PersonalSkillErrorDisplay = {
	message: string;
	detail?: string;
};

interface PersonalSkillEditorProps {
	open: boolean;
	mode: "create" | "edit";
	initialValues: PersonalSkillFormValues;
	existingNames: readonly string[];
	submitError?: PersonalSkillErrorDisplay;
	isSubmitting: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: PersonalSkillFormValues, content: string) => void;
}

type ImportStatus = {
	kind: "success" | "error";
	title: string;
	detail?: string;
};

const beginsWithFrontmatterDelimiter = (content: string): boolean =>
	content
		.replace(/^\uFEFF/, "")
		.split(/\r?\n/, 1)[0]
		?.trim() === "---";

export const PersonalSkillEditor: FC<PersonalSkillEditorProps> = ({
	open,
	mode,
	initialValues,
	existingNames,
	submitError,
	isSubmitting,
	onOpenChange,
	onSubmit,
}) => {
	const isCreate = mode === "create";
	const importId = useId();
	const nameId = useId();
	const nameErrorId = useId();
	const descriptionId = useId();
	const descriptionErrorId = useId();
	const bodyId = useId();
	const bodyErrorId = useId();
	const validationSchema = Yup.object({
		name: Yup.string()
			.trim()
			.required("名称是必填项。")
			.test(
				"skill-name",
				"使用 kebab-case，仅允许小写字母、数字和单个连字符，最多 256 字节。",
				(value) => Boolean(value && isValidPersonalSkillName(value.trim())),
			)
			.test(
				"unique-name",
				"已存在同名技能。",
				(value) =>
					!isCreate ||
					!existingNames.includes(
						value?.trim().toLocaleLowerCase("en-US") ?? "",
					),
			),
		description: Yup.string().test(
			"description-size",
			"描述不得超过 4096 字节。",
			(value) => isValidPersonalSkillDescription(value ?? ""),
		),
		body: Yup.string().test("body-required", "正文是必填项。", (value) =>
			Boolean(value?.trim()),
		),
	});

	const validate = (
		values: PersonalSkillFormValues,
	): FormikErrors<PersonalSkillFormValues> => {
		if (
			getPersonalSkillContentSizeBytes(buildPersonalSkillMarkdown(values)) <=
			PERSONAL_SKILL_MAX_SIZE_BYTES
		) {
			return {};
		}
		return {
			body: `技能内容必须不超过 ${formatKiB(PERSONAL_SKILL_MAX_SIZE_BYTES)}。`,
		};
	};

	const form = useFormik<PersonalSkillFormValues>({
		initialValues,
		enableReinitialize: true,
		validationSchema,
		validate,
		onSubmit: (values) => {
			const normalizedValues = {
				name: values.name.trim(),
				description: values.description.trim(),
				body: values.body.trim(),
			};
			onSubmit(normalizedValues, buildPersonalSkillMarkdown(normalizedValues));
		},
	});

	const [importContent, setImportContent] = useState("");
	const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);

	const importSkillMarkdown = async (contentToImport: string) => {
		if (!contentToImport.trim()) {
			return;
		}

		const result = tryParsePersonalSkillMarkdown(contentToImport);
		if (!result.ok) {
			setImportStatus({
				kind: "error",
				title: "无法解析 SKILL.md",
				detail: result.error,
			});
			return;
		}

		if (isCreate) {
			await form.setValues(result.values);
			await form.setTouched(
				{ name: true, description: true, body: true },
				false,
			);
		} else {
			await form.setValues({
				...form.values,
				description: result.values.description,
				body: result.values.body,
			});
			await form.setTouched(
				{ name: false, description: true, body: true },
				false,
			);
		}

		setImportContent("");
		setImportStatus({
			kind: "success",
			title: "已导入 SKILL.md",
			detail: isCreate
				? "已更新名称、描述和正文字段。"
				: "已更新描述和正文字段，保留了原有名称。",
		});
	};

	const handleImportContentChange = (
		event: ChangeEvent<HTMLTextAreaElement>,
	) => {
		setImportContent(event.target.value);
		setImportStatus(null);
	};

	const handleImportContentPaste = (
		event: ClipboardEvent<HTMLTextAreaElement>,
	) => {
		const pastedContent = event.clipboardData.getData("text");
		if (!beginsWithFrontmatterDelimiter(pastedContent)) {
			return;
		}

		event.preventDefault();
		setImportContent(pastedContent);
		setImportStatus(null);
		void importSkillMarkdown(pastedContent);
	};

	const content = buildPersonalSkillMarkdown(form.values);
	const sizeBytes = getPersonalSkillContentSizeBytes(content);
	const nameError = form.touched.name ? form.errors.name : undefined;
	const descriptionError = form.touched.description
		? form.errors.description
		: undefined;
	const bodyError = form.touched.body ? form.errors.body : undefined;
	const isTooLarge = sizeBytes > PERSONAL_SKILL_MAX_SIZE_BYTES;
	const isNearLimit = sizeBytes > PERSONAL_SKILL_MAX_SIZE_BYTES * 0.9;
	const title = isCreate ? "创建个人技能" : "编辑个人技能";
	const submitLabel = isCreate ? "创建技能" : "保存技能";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={form.handleSubmit}
				>
					<DialogHeader className="px-6 pt-6">
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>
							个人技能可供您的代理使用，并以带 frontmatter 的单个 SKILL.md 文件存储。如需更丰富的技能及支持文件，请将其添加到仓库的 `.agents/skills/` 目录下，或从工作区加载。
						</DialogDescription>
					</DialogHeader>

					<div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-4">
						{submitError && (
							<Alert severity="error">
								<AlertTitle>{submitError.message}</AlertTitle>
								{submitError.detail && (
									<AlertDescription>{submitError.detail}</AlertDescription>
								)}
							</Alert>
						)}

						<div className="flex flex-col gap-3 rounded-md border border-border-default p-4">
							<div className="flex flex-col gap-1">
								<Label htmlFor={importId}>从 SKILL.md 导入</Label>
								<p className="m-0 text-xs text-content-secondary">
									粘贴带有 frontmatter 的完整 SKILL.md 文件，即可自动填充下方字段。
								</p>
							</div>
							<TextareaAutosize
								id={importId}
								value={importContent}
								onChange={handleImportContentChange}
								onPaste={handleImportContentPaste}
								placeholder="---\nname: my-skill\ndescription: ...\n---\n\nBody..."
								disabled={isSubmitting}
								minRows={4}
								maxRows={10}
								className="w-full resize-y rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm leading-relaxed text-content-primary placeholder:text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-content-link disabled:cursor-not-allowed disabled:opacity-50"
							/>
							{importStatus && (
								<Alert severity={importStatus.kind}>
									<AlertTitle>{importStatus.title}</AlertTitle>
									{importStatus.detail && (
										<AlertDescription>{importStatus.detail}</AlertDescription>
									)}
								</Alert>
							)}
							<div className="flex justify-end gap-2">
								{importContent && (
									<Button
										variant="outline"
										size="sm"
										disabled={isSubmitting}
										onClick={() => {
											setImportContent("");
											setImportStatus(null);
										}}
									>
										清除
									</Button>
								)}
								<Button
									size="sm"
									disabled={isSubmitting || !importContent.trim()}
									onClick={() => {
										void importSkillMarkdown(importContent);
									}}
								>
									导入
								</Button>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor={nameId}>名称</Label>
							<Input
								id={nameId}
								name="name"
								value={form.values.name}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								placeholder="review-database-query"
								readOnly={!isCreate}
								disabled={isSubmitting}
								aria-invalid={Boolean(nameError)}
								aria-describedby={nameError ? nameErrorId : undefined}
								className={cn(!isCreate && "bg-surface-secondary")}
							/>
							{nameError ? (
								<p
									id={nameErrorId}
									className="m-0 text-xs text-content-destructive"
								>
									{nameError}
								</p>
							) : (
								<p className="m-0 text-xs text-content-secondary">
									使用小写字母、数字和连字符。创建后名称无法修改。
								</p>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor={descriptionId}>描述</Label>
							<Input
								id={descriptionId}
								name="description"
								value={form.values.description}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								placeholder="何时使用此技能"
								disabled={isSubmitting}
								aria-invalid={Boolean(descriptionError)}
								aria-describedby={
									descriptionError ? descriptionErrorId : undefined
								}
							/>
							{descriptionError && (
								<p
									id={descriptionErrorId}
									className="m-0 text-xs text-content-destructive"
								>
									{descriptionError}
								</p>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor={bodyId}>正文</Label>
							<TextareaAutosize
								id={bodyId}
								name="body"
								value={form.values.body}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								placeholder="描述代理应在何时以及如何使用此技能。"
								disabled={isSubmitting}
								minRows={8}
								aria-invalid={Boolean(bodyError)}
								aria-describedby={bodyError ? bodyErrorId : undefined}
								className={cn(
									"w-full resize-y rounded-md border border-border bg-transparent px-3 py-2 font-mono text-sm leading-relaxed text-content-primary placeholder:text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-content-link disabled:cursor-not-allowed disabled:opacity-50",
									bodyError && "border-border-destructive",
								)}
							/>
							{bodyError && (
								<p
									id={bodyErrorId}
									className="m-0 text-xs text-content-destructive"
								>
									{bodyError}
								</p>
							)}
							<p
								className={cn(
									"m-0 text-xs text-content-secondary",
									isNearLimit && "text-content-warning",
									isTooLarge && "text-content-destructive",
								)}
							>
								已使用 {formatKiB(sizeBytes)}，上限{" "}
								{formatKiB(PERSONAL_SKILL_MAX_SIZE_BYTES)}。
							</p>
						</div>
					</div>

					<DialogFooter className="border-t border-border-default px-6 py-4">
						<Button
							variant="outline"
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
						>
							取消
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || !form.isValid || !form.dirty}
						>
							{isSubmitting && <Spinner className="h-4 w-4" loading />}
							{submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
