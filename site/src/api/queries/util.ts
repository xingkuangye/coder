import type { QueryKey, UseQueryOptions } from "react-query";
import type { MetadataState, MetadataValue } from "#/hooks/useEmbeddedMetadata";

export const disabledRefetchOptions = {
	gcTime: Number.POSITIVE_INFINITY,
	staleTime: Number.POSITIVE_INFINITY,
	refetchOnMount: false,
	refetchOnReconnect: false,
	refetchOnWindowFocus: false,
} as const satisfies Partial<UseQueryOptions>;

type UseQueryOptionsWithMetadata<
	TMetadata extends MetadataValue = MetadataValue,
	TQueryFnData = unknown,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = Omit<
	UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
	"initialData"
> & {
	metadata: MetadataState<TMetadata>;
};

type FormattedQueryOptionsResult<
	TQueryFnData = unknown,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = Omit<
	UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
	"initialData"
> & {
	queryKey: NonNullable<TQueryKey>;
};

/**
 * cachedQuery 允许调用者仅发出一次请求，并在提供 `initialData` 时使用它。
 * 这对于传递通过元数据注入的值特别有用。我们为初始用户获取、buildinfo 和
 * 其他几个场景这样做，以减少页面加载时间。
 */
export function cachedQuery<
	TMetadata extends MetadataValue = MetadataValue,
	TQueryFnData = unknown,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: UseQueryOptionsWithMetadata<
		TMetadata,
		TQueryFnData,
		TError,
		TData,
		TQueryKey
	>,
): FormattedQueryOptionsResult<TQueryFnData, TError, TData, TQueryKey> {
	const { metadata, ...delegatedOptions } = options;
	const newOptions = {
		...delegatedOptions,
		initialData: metadata.available ? metadata.value : undefined,

		// Make sure the disabled options are always serialized last, so that no
		// one using this function can accidentally override the values
		...(metadata.available ? disabledRefetchOptions : {}),
	};

	return newOptions as FormattedQueryOptionsResult<
		TQueryFnData,
		TError,
		TData,
		TQueryKey
	>;
}
