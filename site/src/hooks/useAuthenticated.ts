import {
	type AuthContextValue,
	useAuthContext,
} from "#/contexts/auth/AuthProvider";

type RequireKeys<T, R extends keyof T> = Omit<T, R> & {
	[K in keyof Pick<T, R>]-?: NonNullable<T[K]>;
};

// We can do some TS magic here but I would rather to be explicit on what
// values are not undefined when authenticated
type AuthenticatedAuthContextValue = RequireKeys<
	AuthContextValue,
	"user" | "permissions"
>;

export const useAuthenticated = (): AuthenticatedAuthContextValue => {
	const auth = useAuthContext();

	if (!auth.user) {
		throw new Error("用户未登录。");
	}

	if (!auth.permissions) {
		throw new Error("权限不可用。");
	}

	return auth as AuthenticatedAuthContextValue;
};
