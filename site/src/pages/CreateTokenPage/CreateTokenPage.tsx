import { useFormik } from "formik";
import { type FC, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { API } from "#/api/api";
import { getErrorDetail } from "#/api/errors";
import { ErrorAlert } from "#/components/Alert/ErrorAlert";
import { CodeExample } from "#/components/CodeExample/CodeExample";
import { ConfirmDialog } from "#/components/Dialogs/ConfirmDialog/ConfirmDialog";
import { FullPageHorizontalForm } from "#/components/FullPageForm/FullPageHorizontalForm";
import { Loader } from "#/components/Loader/Loader";
import { pageTitle } from "#/utils/page";
import { CreateTokenForm } from "./CreateTokenForm";
import { type CreateTokenData, NANO_HOUR } from "./utils";

const initialValues: CreateTokenData = {
	name: "",
	lifetime: 30,
};

type CreateTokenPageProps = {
	now?: Date;
};

const CreateTokenPage: FC<CreateTokenPageProps> = ({ now }) => {
	const navigate = useNavigate();

	const {
		mutate: saveToken,
		isPending: isCreating,
		isError: creationFailed,
		isSuccess: creationSuccessful,
		data: newToken,
	} = useMutation({ mutationFn: API.createToken });
	const {
		data: tokenConfig,
		isLoading: fetchingTokenConfig,
		isError: tokenFetchFailed,
		error: tokenFetchError,
	} = useQuery({
		queryKey: ["tokenconfig"],
		queryFn: API.getTokenConfig,
	});

	const [formError, setFormError] = useState<unknown>(undefined);

	const onCreateSuccess = () => {
		toast.success("令牌已创建。");
		navigate("/settings/tokens");
	};

	const onCreateError = (error: unknown) => {
		setFormError(error);
		toast.error("创建令牌失败。", {
			description: getErrorDetail(error),
		});
	};

	const form = useFormik<CreateTokenData>({
		initialValues,
		onSubmit: (values) => {
			saveToken(
				{
					lifetime: values.lifetime * 24 * NANO_HOUR,
					token_name: values.name,
					scope: "all", // tokens are currently unscoped
				},
				{
					onError: onCreateError,
				},
			);
		},
	});

	const tokenDescription = (
		<>
			<p>请务必复制下方的令牌之后继续：</p>
			<CodeExample
				secret={false}
				code={newToken?.key ?? ""}
				className="min-h-0 select-all w-full mt-6"
			/>
		</>
	);

	if (fetchingTokenConfig) {
		return <Loader />;
	}

	return (
		<>
			<title>{pageTitle("创建令牌")}</title>

			{tokenFetchFailed && <ErrorAlert error={tokenFetchError} />}
			<FullPageHorizontalForm
				title="创建令牌"
				detail="所有令牌均不受作用域限制，因此拥有完全的资源访问权限。"
			>
				<CreateTokenForm
					form={form}
					maxTokenLifetime={tokenConfig?.max_token_lifetime}
					formError={formError}
					setFormError={setFormError}
					isCreating={isCreating}
					creationFailed={creationFailed}
					now={now}
				/>

				<ConfirmDialog
					type="info"
					hideCancel
					title="创建成功"
					description={tokenDescription}
					open={creationSuccessful && Boolean(newToken.key)}
					confirmLoading={isCreating}
					onConfirm={onCreateSuccess}
					onClose={onCreateSuccess}
				/>
			</FullPageHorizontalForm>
		</>
	);
};

export default CreateTokenPage;
