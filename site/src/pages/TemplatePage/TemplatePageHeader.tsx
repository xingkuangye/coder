import {
	CopyIcon,
	DownloadIcon,
	EditIcon,
	EllipsisVerticalIcon,
	PlusIcon,
	SettingsIcon,
	TrashIcon,
} from "lucide-react";
import type { FC } from "react";
import { useQuery } from "react-query";
import { Link as RouterLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail } from "#/api/errors";
import { workspaces } from "#/api/queries/workspaces";
import type {
	AuthorizationResponse,
	Template,
	TemplateVersion,
} from "#/api/typesGenerated";
import { Avatar } from "#/components/Avatar/Avatar";
import { Button, Button as ShadcnButton } from "#/components/Button/Button";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { DeleteDialog } from "#/components/Dialogs/DeleteDialog/DeleteDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/DropdownMenu/DropdownMenu";
import { Margins } from "#/components/Margins/Margins";
import { MemoizedInlineMarkdown } from "#/components/Markdown/InlineMarkdown";
import {
	PageHeader,
	PageHeaderSubtitle,
	PageHeaderTitle,
} from "#/components/PageHeader/PageHeader";
import { Pill } from "#/components/Pill/Pill";
import { linkToTemplate, useLinks } from "#/modules/navigation";
import type { WorkspacePermissions } from "#/modules/permissions/workspaces";
import { TemplateStats } from "./TemplateStats";
import { useDeletionDialogState } from "./useDeletionDialogState";

type TemplateMenuProps = {
	organizationName: string;
	templateName: string;
	templateVersion: string;
	templateId: string;
	fileId: string;
	onDelete: () => void;
};

const TemplateMenu: FC<TemplateMenuProps> = ({
	organizationName,
	templateName,
	templateVersion,
	templateId,
	fileId,
	onDelete,
}) => {
	const dialogState = useDeletionDialogState(
		templateId,
		onDelete,
		templateName,
	);
	const navigate = useNavigate();
	const getLink = useLinks();
	const queryText = `organization:${organizationName} template:${templateName}`;
	const workspaceCountQuery = useQuery({
		...workspaces({ q: queryText }),
		select: (res) => res.count,
	});
	const safeToDeleteTemplate = workspaceCountQuery.data === 0;

	const templateLink = getLink(linkToTemplate(organizationName, templateName));

	const handleExport = async (format?: "zip") => {
		try {
			const blob = await API.downloadTemplateVersion(fileId, format);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const extension = format === "zip" ? "zip" : "tar";
			link.download = `${templateName}-${templateVersion}.${extension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to export template:", error);
			toast.error("导出模板失败。", {
				description: getErrorDetail(error),
			});
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ShadcnButton size="icon-lg" variant="subtle" aria-label="打开菜单">
						<EllipsisVerticalIcon aria-hidden="true" />
						<span className="sr-only">打开菜单</span>
					</ShadcnButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() => navigate(`${templateLink}/settings`)}
					>
						<SettingsIcon className="size-icon-sm" />
						设置
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() =>
							navigate(`${templateLink}/versions/${templateVersion}/edit`)
						}
					>
						<EditIcon />
						编辑文件
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() =>
							navigate(`/templates/new?fromTemplate=${templateId}`)
						}
					>
						<CopyIcon className="size-icon-sm" />
						复制&hellip;
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => handleExport()}>
						<DownloadIcon className="size-icon-sm" />
						导出为 TAR
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => handleExport("zip")}>
						<DownloadIcon className="size-icon-sm" />
						导出为 ZIP
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-content-destructive focus:text-content-destructive"
						onClick={dialogState.openDeleteConfirmation}
					>
						<TrashIcon />
						删除&hellip;
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{safeToDeleteTemplate ? (
				<DeleteDialog
					isOpen={dialogState.isDeleteDialogOpen}
					onConfirm={dialogState.confirmDelete}
					onCancel={dialogState.cancelDeleteConfirmation}
					entity="模板"
					name={templateName}
				/>
			) : (
				<ConfirmDialog
					type="info"
					title="无法删除"
					hideCancel={false}
					open={dialogState.isDeleteDialogOpen}
					onClose={dialogState.cancelDeleteConfirmation}
					confirmText="查看工作空间"
					confirmLoading={workspaceCountQuery.status !== "success"}
					onConfirm={() => {
						navigate({
							pathname: "/workspaces",
							search: new URLSearchParams({ filter: queryText }).toString(),
						});
					}}
					description={
						<>
							{workspaceCountQuery.isSuccess && (
								<>
									此模板被{" "}
									<strong>
										{workspaceCountQuery.data} 个工作空间
										{workspaceCountQuery.data === 1 ? "" : "s"}
									</strong>
									使用。 请在删除此模板之前删除所有相关的工作空间。
								</>
							)}

							{workspaceCountQuery.isLoading &&
								"正在加载此模板使用的工作空间信息。"}

							{workspaceCountQuery.isError &&
								"无法确定此模板使用的工作空间。"}
						</>
					}
				/>
			)}
		</>
	);
};

type TemplatePageHeaderProps = {
	template: Template;
	activeVersion: TemplateVersion;
	permissions: AuthorizationResponse;
	workspacePermissions: WorkspacePermissions;
	onDeleteTemplate: () => void;
};

export const TemplatePageHeader: FC<TemplatePageHeaderProps> = ({
	template,
	activeVersion,
	permissions,
	workspacePermissions,
	onDeleteTemplate,
}) => {
	const getLink = useLinks();
	const templateLink = getLink(
		linkToTemplate(template.organization_name, template.name),
	);

	return (
		<Margins>
			<PageHeader
				actions={
					<>
						{!template.deprecated &&
							workspacePermissions.createWorkspaceForUserID && (
								<Button asChild>
									<RouterLink to={`${templateLink}/workspace`}>
										<PlusIcon />
										创建工作空间
									</RouterLink>
								</Button>
							)}

						{permissions.canUpdateTemplate && (
							<TemplateMenu
								organizationName={template.organization_name}
								templateId={template.id}
								templateName={template.name}
								templateVersion={activeVersion.name}
								fileId={activeVersion.job.file_id}
								onDelete={onDeleteTemplate}
							/>
						)}
					</>
				}
			>
				<div className="flex flex-row gap-4">
					<Avatar
						size="lg"
						variant="icon"
						src={template.icon}
						fallback={template.name}
					/>
					<div>
						<div className="flex flex-row items-center gap-2">
							<PageHeaderTitle>
								{template.display_name.length > 0
									? template.display_name
									: template.name}
							</PageHeaderTitle>
							{template.deprecated && <Pill type="warning">已弃用</Pill>}
						</div>

						{template.deprecation_message !== "" ? (
							<PageHeaderSubtitle>
								<MemoizedInlineMarkdown>
									{template.deprecation_message}
								</MemoizedInlineMarkdown>
							</PageHeaderSubtitle>
						) : (
							template.description !== "" && (
								<PageHeaderSubtitle>{template.description}</PageHeaderSubtitle>
							)
						)}
					</div>
				</div>
			</PageHeader>
			<div className="pb-8">
				<TemplateStats template={template} activeVersion={activeVersion} />
			</div>
		</Margins>
	);
};
