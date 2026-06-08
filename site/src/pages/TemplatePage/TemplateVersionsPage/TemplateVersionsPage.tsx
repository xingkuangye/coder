import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail, getErrorMessage } from "#/api/errors";
import {
	templateVersions,
	templateVersionsQueryKey,
} from "#/api/queries/templates";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { linkToTemplate, useLinks } from "#/modules/navigation";
import { useTemplateLayoutContext } from "#/pages/TemplatePage/TemplateLayout";
import { getTemplatePageTitle } from "../utils";
import { VersionsTable } from "./VersionsTable";

const TemplateVersionsPage = () => {
	const navigate = useNavigate();
	const getLink = useLinks();
	const { template, permissions } = useTemplateLayoutContext();
	const queryClient = useQueryClient();
	const templateLink = getLink(
		linkToTemplate(template.organization_name, template.name),
	);
	const { data } = useQuery(templateVersions(template.id));
	// We use this to update the active version in the UI without having to refetch the template
	const [latestActiveVersion, setLatestActiveVersion] = useState(
		template.active_version_id,
	);
	const { mutate: promoteVersion, isPending: isPromoting } = useMutation({
		mutationFn: (templateVersionId: string) => {
			return API.updateActiveTemplateVersion(template.id, {
				id: templateVersionId,
			});
		},
		onSuccess: async () => {
			const versionName = data?.find(
				(v) => v.id === selectedVersionIdToPromote,
			)?.name;
			setLatestActiveVersion(selectedVersionIdToPromote as string);
			setSelectedVersionIdToPromote(undefined);
			toast.success(
				versionName
					? `版本 "${versionName}" 已成功提升。`
					: "版本已成功提升。",
				{
					action: {
						label: "查看模板",
						onClick: () => navigate(templateLink),
					},
				},
			);
		},
		onError: (error) => {
			const versionName = data?.find(
				(v) => v.id === selectedVersionIdToPromote,
			)?.name;
			toast.error(
				getErrorMessage(
					error,
					versionName
						? `提升版本 "${versionName}" 失败。`
						: "提升版本失败。",
				),
				{
					description: getErrorDetail(error),
				},
			);
		},
	});

	const { mutate: archiveVersion, isPending: isArchiving } = useMutation({
		mutationFn: (templateVersionId: string) => {
			return API.archiveTemplateVersion(templateVersionId);
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: templateVersionsQueryKey(template.id),
			});
			setSelectedVersionIdToArchive(undefined);
			toast.success(`版本 "${data.name}" 已成功归档。`);
		},
		onError: (error) => {
			const versionName = data?.find(
				(v) => v.id === selectedVersionIdToArchive,
			)?.name;
			toast.error(
				getErrorMessage(
					error,
					versionName
						? `归档版本 "${versionName}" 失败。`
						: "归档版本失败。",
				),
				{
					description: getErrorDetail(error),
				},
			);
		},
	});

	const [selectedVersionIdToPromote, setSelectedVersionIdToPromote] = useState<
		string | undefined
	>();
	const [selectedVersionIdToArchive, setSelectedVersionIdToArchive] = useState<
		string | undefined
	>();

	return (
		<>
			<title>{getTemplatePageTitle("版本", template)}</title>

			<VersionsTable
				versions={data}
				onPromoteClick={
					permissions.canUpdateTemplate
						? setSelectedVersionIdToPromote
						: undefined
				}
				onArchiveClick={
					permissions.canUpdateTemplate
						? setSelectedVersionIdToArchive
						: undefined
				}
				activeVersionId={latestActiveVersion}
			/>
			{/* 提升确认 */}
			<ConfirmDialog
				type="info"
				hideCancel={false}
				open={selectedVersionIdToPromote !== undefined}
				onConfirm={() => {
					promoteVersion(selectedVersionIdToPromote as string);
				}}
				onClose={() => setSelectedVersionIdToPromote(undefined)}
				title="提升版本"
				confirmLoading={isPromoting}
				confirmText="提升"
				description="确定要提升此版本吗？提升后，工作区将收到“更新”到此版本的提示。"
			/>
			{/* 归档确认 */}
			<ConfirmDialog
				type="info"
				hideCancel={false}
				open={selectedVersionIdToArchive !== undefined}
				onConfirm={() => {
					archiveVersion(selectedVersionIdToArchive as string);
				}}
				onClose={() => setSelectedVersionIdToArchive(undefined)}
				title="归档版本"
				confirmLoading={isArchiving}
				confirmText="归档"
				description="确定要归档此版本吗（此操作可逆）？归档后，工作区将无法使用此版本。"
			/>
		</>
	);
};

export default TemplateVersionsPage;
