import type { FC } from "react";
import type { ApiErrorResponse } from "#/api/errors";
import type { ExternalAuthDevice } from "#/api/typesGenerated";
import { GitDeviceAuth } from "#/components/GitDeviceAuth/GitDeviceAuth";
import { SignInLayout } from "#/components/SignInLayout/SignInLayout";
import { Welcome } from "#/components/Welcome/Welcome";

interface LoginOAuthDevicePageViewProps {
	authenticated: boolean;
	redirectUrl: string;
	externalAuthDevice?: ExternalAuthDevice;
	deviceExchangeError?: ApiErrorResponse;
}

const LoginOAuthDevicePageView: FC<LoginOAuthDevicePageViewProps> = ({
	authenticated,
	redirectUrl,
	deviceExchangeError,
	externalAuthDevice,
}) => {
	if (!authenticated) {
		return (
			<SignInLayout>
				<Welcome>使用 GitHub 进行认证</Welcome>

				<GitDeviceAuth
					deviceExchangeError={deviceExchangeError}
					externalAuthDevice={externalAuthDevice}
				/>
			</SignInLayout>
		);
	}

	return (
		<SignInLayout>
			<Welcome>您已通过 GitHub 认证！</Welcome>

			<p className="m-0 text-center text-base leading-relaxed text-content-secondary">
				如果您没有自动跳转，请{" "}
				<a href={redirectUrl}>点击这里</a>。
			</p>
		</SignInLayout>
	);
};

export default LoginOAuthDevicePageView;
