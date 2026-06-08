import clamp from "lodash/clamp";
import { useEffect, useEffectEvent } from "react";
import {
	keepPreviousData,
	type QueryFunctionContext,
	type QueryKey,
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
	useQueryClient,
} from "react-query";
import { type SetURLSearchParams, useSearchParams } from "react-router";

const DEFAULT_RECORDS_PER_PAGE = 25;

/**
 * 用于从搜索参数中获取/设置页码的键
 */
const PAGE_NUMBER_PARAMS_KEY = "page";

/**
 * UseQueryOptions 的专用版本，专门为分页查询构建。
 */
export type UsePaginatedQueryOptions<
	// Aside from TQueryPayload, all type parameters come from the base React
	// Query type definition, and are here for compatibility
	TQueryFnData extends PaginatedData = PaginatedData,
	TQueryPayload = never,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = BasePaginationOptions<TQueryFnData, TError, TData, TQueryKey> &
	QueryPayloadExtender<TQueryPayload> & {
		/**
		 * React Router 的 URLSearchParams 的可选依赖。如果提供了此参数，
		 * 所有 URL 状态更改都将通过此对象而不是内部值。
		 */
		searchParams?: URLSearchParams;

		/**
		 * 一个函数，接收分页信息并生成完整的查询键。
		 *
		 * 必须是一个函数，以便它既可以用于活动查询，也可以重用于任何预取查询（替换页码）。
		 */
		queryKey: (params: QueryPageParamsWithPayload<TQueryPayload>) => TQueryKey;

		/**
		 * queryFn 的一个版本，是必需的，并通过其查询函数上下文参数公开分页信息
		 */
		queryFn: (
			context: PaginatedQueryFnContext<TQueryKey, TQueryPayload>,
		) => TQueryFnData | Promise<TQueryFnData>;

		/**
		 * 一个可选的自定义函数，用于处理用户导航到分页数据中不存在的页面的情况。
		 *
		 * 如果遇到无效页面时未定义/提供此函数，usePaginatedQuery 将默认将用户导航到最接近的有效页面。
		 */
		onInvalidPageChange?: (params: InvalidPageParams) => void;

		/**
		 * 默认为 true。允许你禁用对请求成本非常高的页面的预取。
		 */
		prefetch?: boolean;
	};

/**
 * 调用 usePaginatedQuery 的结果。尽可能镜像基础 useQuery 的结果，同时添加额外的分页属性。
 */
export type UsePaginatedQueryResult<
	TData = unknown,
	TError = unknown,
> = UseQueryResult<TData, TError> & PaginationResultInfo;

export function usePaginatedQuery<
	TQueryFnData extends PaginatedData = PaginatedData,
	TQueryPayload = never,
	TError = unknown,
	TData extends PaginatedData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
>(
	options: UsePaginatedQueryOptions<
		TQueryFnData,
		TQueryPayload,
		TError,
		TData,
		TQueryKey
	>,
): UsePaginatedQueryResult<TData, TError> {
	const {
		queryKey,
		queryPayload,
		onInvalidPageChange,
		searchParams: outerSearchParams,
		queryFn: outerQueryFn,
		prefetch = true,
		staleTime = 60 * 1000, // One minute
		...extraOptions
	} = options;

	const [innerSearchParams, setSearchParams] = useSearchParams();
	const searchParams = outerSearchParams ?? innerSearchParams;

	const limit = DEFAULT_RECORDS_PER_PAGE;
	const currentPage = parsePage(searchParams);
	const currentPageOffset = (currentPage - 1) * limit;

	type Options = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
	const getQueryOptionsFromPage = (pageNumber: number): Options => {
		const pageParams: QueryPageParams = {
			pageNumber,
			limit,
			offset: (pageNumber - 1) * limit,
			searchParams: getParamsWithoutPage(searchParams),
		};

		const payload = queryPayload?.(pageParams) as RuntimePayload<TQueryPayload>;
		return {
			staleTime,
			queryKey: queryKey({ ...pageParams, payload }),
			queryFn: (context: QueryFunctionContext<TQueryKey>) => {
				return outerQueryFn({ ...context, ...pageParams, payload });
			},
		};
	};

	// Not using infinite query right now because that requires a fair bit of list
	// virtualization as the lists get bigger (especially for the audit logs).
	// Keeping initial implementation simple.
	const query = useQuery<TQueryFnData, TError, TData, TQueryKey>({
		...extraOptions,
		...getQueryOptionsFromPage(currentPage),
		placeholderData: keepPreviousData,
	});

	const count = query.data?.count;
	const countCap = query.data?.count_cap;
	const countIsCapped =
		countCap !== undefined &&
		countCap > 0 &&
		count !== undefined &&
		count > countCap;
	const totalRecords = countIsCapped ? countCap : count;
	let totalPages =
		totalRecords !== undefined
			? Math.max(
					Math.ceil(totalRecords / limit),
					// True count is not known; let them navigate forward
					// until they hit an empty page (checked below).
					countIsCapped ? currentPage : 0,
				)
			: undefined;

	// When the true count is unknown, the user can navigate past
	// all actual data. If that happens, we need to redirect (via
	// updatePageIfInvalid) to the last page guaranteed to be not
	// empty.
	const pageIsEmpty =
		query.data != null &&
		!Object.values(query.data).some((v) => Array.isArray(v) && v.length > 0);
	if (pageIsEmpty) {
		totalPages = count !== undefined ? Math.ceil(count / limit) : 1;
	}

	const hasNextPage =
		totalRecords !== undefined &&
		((countIsCapped && !pageIsEmpty) ||
			limit + currentPageOffset < totalRecords);
	const hasPreviousPage =
		totalRecords !== undefined &&
		currentPage > 1 &&
		((countIsCapped && !pageIsEmpty) ||
			currentPageOffset - limit < totalRecords);

	const queryClient = useQueryClient();
	const prefetchPage = useEffectEvent((newPage: number) => {
		if (!prefetch) {
			return;
		}

		const options = getQueryOptionsFromPage(newPage);
		return queryClient.prefetchQuery(options);
	});

	// Have to split hairs and sync on both the current page and the hasXPage
	// variables, because the page can change immediately client-side, but the
	// hasXPage values are derived from the server and won't always be immediately
	// ready on the initial render
	useEffect(() => {
		if (hasNextPage) {
			void prefetchPage(currentPage + 1);
		}
	}, [currentPage, hasNextPage]);

	useEffect(() => {
		if (hasPreviousPage) {
			void prefetchPage(currentPage - 1);
		}
	}, [currentPage, hasPreviousPage]);

	// Mainly here to catch user if they navigate to a page directly via URL;
	// totalPages parameterized to insulate function from fetch status changes
	const updatePageIfInvalid = useEffectEvent(async (totalPages: number) => {
		// If totalPages is 0, that's a sign that the currentPage overshot, and the
		// API returned a count of 0 because it didn't know how to process the query
		let fixedTotalPages: number;
		if (totalPages !== 0) {
			fixedTotalPages = totalPages;
		} else {
			const firstPageOptions = getQueryOptionsFromPage(1);
			try {
				const firstPageResult = await queryClient.fetchQuery(firstPageOptions);
				const rounded = Math.ceil(firstPageResult?.count ?? 0 / limit);
				fixedTotalPages = Math.max(rounded, 1);
			} catch {
				fixedTotalPages = 1;
			}
		}

		const clamped = clamp(currentPage, 1, fixedTotalPages);
		if (currentPage === clamped) {
			return;
		}

		const withoutPage = getParamsWithoutPage(searchParams);
		if (onInvalidPageChange === undefined) {
			withoutPage.set(PAGE_NUMBER_PARAMS_KEY, String(clamped));
			setSearchParams(withoutPage);
		} else {
			const params: InvalidPageParams = {
				limit,
				setSearchParams,
				offset: currentPageOffset,
				searchParams: withoutPage,
				totalPages: fixedTotalPages,
				pageNumber: currentPage,
			};

			onInvalidPageChange(params);
		}
	});

	useEffect(() => {
		if (
			!query.isFetching &&
			totalPages !== undefined &&
			currentPage > totalPages
		) {
			void updatePageIfInvalid(totalPages);
		}
	}, [query.isFetching, totalPages, currentPage]);

	const onPageChange = (newPage: number) => {
		// Page 1 is the only page that can be safely navigated to without knowing
		// totalPages; no reliance on server data for math calculations
		if (totalPages === undefined && newPage !== 1) {
			return;
		}

		// If the true count is unknown, we allow navigating past the
		// known page range.
		const upperBound = countIsCapped
			? Number.MAX_SAFE_INTEGER
			: (totalPages ?? 1);
		const cleanedInput = clamp(Math.trunc(newPage), 1, upperBound);
		if (Number.isNaN(cleanedInput)) {
			return;
		}

		searchParams.set(PAGE_NUMBER_PARAMS_KEY, String(cleanedInput));
		setSearchParams(searchParams);
	};

	// Have to do a type assertion for final return type to make React Query's
	// internal types happy; splitting type definitions up to limit risk of the
	// type assertion silencing type warnings we actually want to pay attention to
	const info: PaginationResultInfo = {
		limit,
		currentPage,
		onPageChange,
		goToFirstPage: () => onPageChange(1),

		goToPreviousPage: () => {
			if (hasPreviousPage) {
				onPageChange(currentPage - 1);
			}
		},

		goToNextPage: () => {
			if (hasNextPage) {
				onPageChange(currentPage + 1);
			}
		},

		...(query.isSuccess
			? {
					isSuccess: true,
					hasNextPage,
					hasPreviousPage,
					totalRecords: totalRecords as number,
					totalPages: totalPages as number,
					currentOffsetStart: currentPageOffset + 1,
					countIsCapped,
				}
			: {
					isSuccess: false,
					hasNextPage: false,
					hasPreviousPage: false,
					totalRecords: undefined,
					totalPages: undefined,
					currentOffsetStart: undefined,
					countIsCapped: false as const,
				}),
	};

	return { ...query, ...info } as UsePaginatedQueryResult<TData, TError>;
}

function parsePage(params: URLSearchParams): number {
	const parsed = Number(params.get("page"));
	return Number.isInteger(parsed) && parsed > 1 ? parsed : 1;
}

/**
 * 从查询中剥离页码，以避免页码与 usePaginatedQuery 的 currentPage 属性不匹配（尤其是在预取时）
 */
function getParamsWithoutPage(params: URLSearchParams): URLSearchParams {
	const withoutPage = new URLSearchParams(params);
	withoutPage.delete(PAGE_NUMBER_PARAMS_KEY);
	return withoutPage;
}

/**
 * UsePaginatedQueryResult 的所有分页属性。拆分开来，以便类型可以在多个地方单独使用。
 */
export type PaginationResultInfo = {
	currentPage: number;
	limit: number;
	onPageChange: (newPage: number) => void;
	goToPreviousPage: () => void;
	goToNextPage: () => void;
	goToFirstPage: () => void;
} & (
	| {
			isSuccess: false;
			hasNextPage: false;
			hasPreviousPage: false;
			totalRecords: undefined;
			totalPages: undefined;
			currentOffsetStart: undefined;
			countIsCapped: false;
	  }
	| {
			isSuccess: true;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
			totalRecords: number;
			totalPages: number;
			currentOffsetStart: number;
			countIsCapped: boolean;
	  }
);

/**
 * 在类型层面掩盖 queryPayload 函数的定义方式，使 UsePaginatedQueryOptions 看起来不那么吓人。
 *
 * 你会在此文件的几个不同地方看到这些元组类型；这是一个“技巧”，用于规避通常通过直接/“明显”方式在 queryPayload、queryKey 和 queryFn 之间共享 TQueryPayload 时出现的函数逆变。
 * 通过将类型放入元组（它们天生是协变的），可以更容易地共享类型，而不会导致 TypeScript 一直抱怨或变得过于困惑，从而将类型定义降级为一堆 "any" 类型。
 */
type QueryPayloadExtender<TQueryPayload = never> = [TQueryPayload] extends [
	never,
]
	? { queryPayload?: never }
	: {
			/**
			 * 一个可选函数，用于定义可重用的“模式”，接收分页数据（当前页码等），
			 * 将被评估并传递给 queryKey 和 queryFn，用于活动查询和预取查询。
			 *
			 * queryKey 和 queryFn 都可以通过从其主函数参数中访问 "payload" 属性来获取 queryPayload 的结果。
			 */
			queryPayload: (params: QueryPageParams) => TQueryPayload;
		};

/**
 * 分页请求的相关信息。此信息会传递给 hook 的 queryPayload、queryKey 和 queryFn 属性。
 */
type QueryPageParams = {
	/**
	 * 在评估 queryKey 和 queryFn 时使用的页码。在渲染期间，pageNumber 将是当前页，
	 * 但在任何预取中，它将是下一页/上一页。
	 */
	pageNumber: number;

	/**
	 * 每次查询要拉取的数据记录数。目前根据 PaginationWidget 的 utils 文件中的值硬编码。
	 */
	limit: number;

	/**
	 * 用于查询的页面偏移量。仅为方便而设；也可以从 pageNumber 和 limit 推导得出。
	 */
	offset: number;

	/**
	 * 当前的 URL 搜索参数。可用于让你从 URL 中获取某些搜索词。
	 */
	searchParams: URLSearchParams;
};

/**
 * 怪异且难以描述的类型定义，但对于确保涉及 queryPayload 函数的类型信息能正确收窄是必需的。
 */
type RuntimePayload<TPayload = never> = [TPayload] extends [never]
	? undefined
	: TPayload;

/**
 * 查询页面参数，附加了 queryPayload 函数的结果。
 * 此类型传递给 queryKey 和 queryFn。如果 queryPayload 未定义，则 payload 将始终为 undefined。
 */
type QueryPageParamsWithPayload<TPayload = never> = QueryPageParams & {
	payload: RuntimePayload<TPayload>;
};

/**
 * API 返回的任何可 JSON 序列化的对象，它公开了匹配查询的记录总数。
 */
export type PaginatedData = {
	count: number;
	count_cap?: number;
};

/**
 * React Query 的 QueryFunctionContext（减去 pageParam，因为它很奇怪且默认为 any 类型），
 * 以及 QueryPageParamsWithPayload 的所有属性。
 */
type PaginatedQueryFnContext<
	TQueryKey extends QueryKey = QueryKey,
	TPayload = never,
> = Omit<QueryFunctionContext<TQueryKey>, "pageParam"> &
	QueryPageParamsWithPayload<TPayload>;

/**
 * UsePaginatedQueryOptions 所基于的 React Query 属性集。
 *
 * 从中剥离了三个属性：
 * - keepPreviousData - 必须始终为 true 以保持分页体验良好，因此最好阻止任何人尝试触碰它
 * - queryFn - 移除，以便更容易地用带有自定义上下文参数的自定义 queryFn 类型定义替换
 * - queryKey - 移除，以便可以用函数形式的 queryKey 替代
 * - onSuccess/onError - 在 React Query v5 中已弃用并移除
 */
type BasePaginationOptions<
	TQueryFnData extends PaginatedData = PaginatedData,
	TError = unknown,
	TData = TQueryFnData,
	TQueryKey extends QueryKey = QueryKey,
> = Omit<
	UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
	"keepPreviousData" | "queryKey" | "queryFn" | "onSuccess" | "onError"
>;

/**
 * 传递给自定义 onInvalidPageChange 回调的参数。
 */
type InvalidPageParams = QueryPageParams & {
	totalPages: number;
	setSearchParams: SetURLSearchParams;
};
