import { RefreshCwIcon } from "lucide-react";
import type { FC } from "react";
import { useMutation } from "react-query";
import { toast } from "sonner";
import { API } from "#/api/api";
import type { InvalidatePresetsResponse } from "#/api/typesGenerated";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { Button } from "#/components/Button/Button";
import { useTemplateLayoutContext } from "#/pages/TemplatePage/TemplateLayout";
import { pageTitle } from "#/utils/page";

const TemplatePrebuildsPage: FC = () => {
	const { template } = useTemplateLayoutContext();

	return (
		<>
			<title>{pageTitle(`${template.name} - 预构建`)}</title>
			<TemplatePrebuildsPageView templateId={template.id} />
		</>
	);
};

interface TemplatePrebuildsPageViewProps {
	templateId: string;
}

export const TemplatePrebuildsPageView: FC<TemplatePrebuildsPageViewProps> = ({
	templateId,
}) => {
	const invalidateMutation = useMutation({
		mutationFn: () => API.invalidateTemplatePresets(templateId),
		onSuccess: (data: InvalidatePresetsResponse) => {
			if (data.invalidated.length === 0) {
				toast.success("没有模板预设需要失效。");
				return;
			}

			// They all have the same template version
			const { template_version_name } = data.invalidated[0];
			const count = data.invalidated.length;

			toast.success(
				`已使版本“${template_version_name}”的 ${count} 个预设失效。`,
			);
		},
	});

	return (
		<div className="flex">
			<div className="max-w-xl space-y-6">
				{invalidateMutation.error && (
					<ErrorAlert error={invalidateMutation.error} />
				)}
				<div>
					<h3 className="text-xl text-content-primary m-0">
						使预设失效
					</h3>
					<p className="text-sm text-content-secondary">
						活动模板版本的所有预构建工作区被标记为无效。当预构建由于仓库更改或基础设施更新而变得过时并需要回收时，此操作非常有用。
					</p>
				</div>

				<div>
					<Button
						onClick={() => invalidateMutation.mutate()}
						disabled={invalidateMutation.isPending}
						className="gap-2"
					>
						<RefreshCwIcon className="size-4" />
						立即失效
					</Button>
				</div>
			</div>
		</div>
	);
};

export default TemplatePrebuildsPage;
