import TextField from "@mui/material/TextField";
import type { FC, ReactNode } from "react";
import { isApiValidationError, mapApiErrorToFieldErrors } from "#/api/errors";
import type * as TypesGen from "#/api/typesGenerated";
import { Button } from "#/components/Button/Button";
import { Spinner } from "#/components/Spinner/Spinner";

type OAuth2AppFormProps = {
	app?: TypesGen.OAuth2ProviderApp;
	onSubmit: (data: {
		name: string;
		callback_url: string;
		icon: string;
	}) => void;
	error?: unknown;
	isUpdating: boolean;
	actions?: ReactNode;
	defaultValues?: {
		name: string;
		callback_url: string;
		icon: string;
	};
	disabled: boolean;
};

export const OAuth2AppForm: FC<OAuth2AppFormProps> = ({
	app,
	onSubmit,
	error,
	isUpdating,
	actions,
	defaultValues,
	disabled,
}) => {
	const apiValidationErrors = isApiValidationError(error)
		? mapApiErrorToFieldErrors(error.response.data)
		: undefined;

	return (
		<form
			className="mt-2.5"
			onSubmit={(event) => {
				event.preventDefault();
				const formData = new FormData(event.target as HTMLFormElement);
				onSubmit({
					name: formData.get("name") as string,
					callback_url: formData.get("callback_url") as string,
					icon: formData.get("icon") as string,
				});
			}}
		>
			<div className="flex flex-col gap-5">
				<TextField
					name="name"
					label="应用名称"
					defaultValue={app?.name ?? defaultValues?.name}
					error={Boolean(apiValidationErrors?.name)}
					helperText={
						apiValidationErrors?.name || "您的 Coder 应用的名称。"
					}
					disabled={disabled}
					autoFocus
					fullWidth
				/>
				<TextField
					name="callback_url"
					label="回调 URL"
					defaultValue={app?.callback_url ?? defaultValues?.callback_url}
					error={Boolean(apiValidationErrors?.callback_url)}
					helperText={
						apiValidationErrors?.callback_url ||
						"用户授权安装后重定向到的完整 URL。"
					}
					disabled={disabled}
					fullWidth
				/>
				<TextField
					name="icon"
					label="应用图标"
					defaultValue={app?.icon ?? defaultValues?.icon}
					error={Boolean(apiValidationErrors?.icon)}
					helperText={
						apiValidationErrors?.icon || "指向图标的完整或相对 URL。"
					}
					disabled={disabled}
					fullWidth
				/>

				<div className="flex flex-row gap-4">
					<Button disabled={isUpdating || disabled} type="submit">
						<Spinner loading={isUpdating} />
						{app ? "更新应用" : "创建应用"}
					</Button>
					{actions}
				</div>
			</div>
		</form>
	);
};
