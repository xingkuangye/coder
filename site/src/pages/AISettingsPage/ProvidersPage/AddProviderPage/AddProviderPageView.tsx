import { ArrowLeftIcon } from "lucide-react";
import { useMutation, useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { getErrorMessage } from "#/api/errors";
import { createAIProviderMutation } from "#/api/queries/aiProviders";
import { Avatar } from "#/components/Avatar/Avatar";
import { Button } from "#/components/Button/Button";
import { SettingsHeaderTitle } from "#/components/SettingsHeader/SettingsHeader";
import type { AddableProvider } from "../components/addableProviderTypes";
import { ProviderForm } from "../components/ProviderForm";
import { getProviderIcon } from "../components/ProviderIcon";
import { providerFormValuesToCreate } from "../components/providerFormApiMap";

interface AddProviderPageViewProps {
	provider: AddableProvider;
}

const indefiniteArticle = (word: string): string =>
	/^[aeiou]/i.test(word) ? "an" : "a";

const AddProviderPageView: React.FC<AddProviderPageViewProps> = ({
	provider,
}) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createMutation = useMutation(createAIProviderMutation(queryClient));

	return (
		<>
			<Link to="/ai/settings" className="-ml-3">
				<Button variant="subtle">
					<ArrowLeftIcon />
					<span>返回提供商列表</span>
				</Button>
			</Link>
			<div className="flex flex-col gap-6 pt-6">
				<div className="flex items-center gap-4 min-w-0">
					<Avatar
						variant="icon"
						size="lg"
						src={getProviderIcon(provider.value)}
					/>
					<SettingsHeaderTitle>{`添加 ${provider.label} 提供商`}</SettingsHeaderTitle>
				</div>
				<p className="text-sm text-content-secondary m-0">
					配置连接详情和凭证。
				</p>
				<div className="border border-solid p-6 rounded-lg">
					<ProviderForm
						editing={false}
						initialValues={{ type: provider.value }}
						isLoading={createMutation.isPending}
						submitError={createMutation.error}
						onSubmit={async (values) => {
							const request = providerFormValuesToCreate(values);
							try {
								const res = await createMutation.mutateAsync(request);
								toast.success(
									`提供商 "${res.display_name || res.name}" 已添加。`,
								);
								// Awaited so the form's submitting state stays true through
								// navigation, keeping the unsaved-changes prompt suppressed.
								await navigate(`/ai/settings/${res.name}`);
							} catch (error) {
								const name = values.name.trim();
								toast.error(
									getErrorMessage(
										error,
										name
											? `添加提供商 "${name}" 失败。`
											: "添加提供商失败。",
									),
								);
							}
						}}
					/>
				</div>
			</div>
		</>
	);
};

export default AddProviderPageView;
