import type { FC } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { getErrorDetail } from "#/api/errors";
import { postApp } from "#/api/queries/oauth2";
import { useAuthenticated } from "#/hooks/useAuthenticated";
import { pageTitle } from "#/utils/page";
import { CreateOAuth2AppPageView } from "./CreateOAuth2AppPageView";

const CreateOAuth2AppPage: FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { permissions } = useAuthenticated();
	const queryClient = useQueryClient();
	const postAppMutation = useMutation(postApp(queryClient));
	const canCreateApp = permissions.createOAuth2App;

	const defaultValues = {
		name: searchParams.get("name") ?? "",
		callback_url: searchParams.get("callback_url") ?? "",
		icon: searchParams.get("icon") ?? "",
	};

	return (
		<>
			<title>{pageTitle("新建 OAuth2 应用")}</title>

			<CreateOAuth2AppPageView
				isUpdating={postAppMutation.isPending}
				error={postAppMutation.error}
				defaultValues={defaultValues}
				createApp={async (req) => {
					const mutation = postAppMutation.mutateAsync(req, {
						onSuccess: (app) => {
							navigate(
								`/deployment/oauth2-provider/apps/${app.id}?created=true`,
							);
						},
					});
					toast.promise(mutation, {
						loading: `正在创建 OAuth2 应用 "${req.name}"...`,
						success: (app) =>
							`OAuth2 应用 "${app.name}" 创建成功。`,
						error: (error) => ({
							message: `创建 OAuth2 应用 "${req.name}" 失败。`,
							description: getErrorDetail(error),
						}),
					});
				}}
				canCreateApp={canCreateApp}
			/>
		</>
	);
};

export default CreateOAuth2AppPage;
