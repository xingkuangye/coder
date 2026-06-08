import { type FC, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { API } from "#/api/api";
import { isApiError } from "#/api/errors";
import { Loader } from "#/components/Loader/Loader";
import { ProxyProvider as ProductionProxyProvider } from "#/contexts/ProxyContext";
import { DashboardProvider as ProductionDashboardProvider } from "#/modules/dashboard/DashboardProvider";
import { embedRedirect } from "#/utils/redirect";
import { useAuthContext } from "./AuthProvider";

type RequireAuthProps = Readonly<{
	ProxyProvider?: typeof ProductionProxyProvider;
	DashboardProvider?: typeof ProductionDashboardProvider;
}>;

/**
 * 包装任何组件，确保用户在访问组件内容之前已通过身份验证。
 *
 * 在生产环境中，假设不会为此组件传入任何属性。但为了便于测试，您可以传入特定的 Provider 来模拟它们。
 */
export const RequireAuth: FC<RequireAuthProps> = ({
	DashboardProvider = ProductionDashboardProvider,
	ProxyProvider = ProductionProxyProvider,
}) => {
	const location = useLocation();
	const { signOut, isSigningOut, isSignedOut, isSignedIn, isLoading } =
		useAuthContext();

	useEffect(() => {
		if (isLoading || isSigningOut || !isSignedIn) {
			return;
		}

		const axiosInstance = API.getAxiosInstance();
		const interceptorHandle = axiosInstance.interceptors.response.use(
			(okResponse) => okResponse,
			(error: unknown) => {
				// 401 Unauthorized
				// If we encountered an authentication error, then our token is probably
				// invalid and we should update the auth state to reflect that.
				if (isApiError(error) && error.response.status === 401) {
					signOut();
				}

				// Otherwise, pass the response through so that it can be displayed in
				// the UI
				return Promise.reject(error);
			},
		);

		return () => {
			axiosInstance.interceptors.response.eject(interceptorHandle);
		};
	}, [isLoading, isSigningOut, isSignedIn, signOut]);

	if (isLoading || isSigningOut) {
		return <Loader fullscreen />;
	}

	if (isSignedOut) {
		const isHomePage = location.pathname === "/";
		const navigateTo = isHomePage
			? "/login"
			: embedRedirect(`${location.pathname}${location.search}`);

		return (
			<Navigate to={navigateTo} state={{ isRedirect: !isHomePage }} replace />
		);
	}

	// Authenticated pages have access to some contexts for knowing enabled experiments
	// and where to route workspace connections.
	return (
		<DashboardProvider>
			<ProxyProvider>
				<Outlet />
			</ProxyProvider>
		</DashboardProvider>
	);
};
