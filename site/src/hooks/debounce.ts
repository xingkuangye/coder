/**
 * @file 定义了用于创建函数和任意值的防抖版本的钩子。
 *
 * 在 React 渲染过程中调用大多数通用防抖工具函数是不安全的。这是因为处理防抖逻辑的状态存在于工具函数中，而非 React 中。
 * 如果在行内调用通用防抖函数，每次渲染都会创建一个新的有状态函数，这会带来许多有关状态冲突/矛盾的风险。
 */
import { useCallback, useEffect, useRef, useState } from "react";

type UseDebouncedFunctionReturn<Args extends unknown[]> = Readonly<{
	debounced: (...args: Args) => void;

	// Mainly here to make interfacing with useEffect cleanup functions easier
	cancelDebounce: () => void;
}>;

/**
 * 创建一个能够应对 React 重新渲染的防抖函数，以及一个用于取消待处理防抖的函数。
 *
 * 返回的函数将保持相同的内存引用，但防抖函数始终能“看到”传入钩子的最新参数，并相应地使用它们。
 *
 * 如果在回调已排队等待执行时防抖时间发生变化，该回调不会被取消。
 *
 * 除了静态的防抖时间外，还可以传入一个函数以启用动态防抖值（例如使复选框立即触发，但对文本输入进行防抖处理）。
 */
export function useDebouncedFunction<
	// Parameterizing on the args instead of the whole callback function type to
	// avoid type contravariance issues
	Args extends unknown[] = unknown[],
>(
	callback: (...args: Args) => void | Promise<void>,
	debounceTimeoutMs: number | ((...args: Args) => number),
): UseDebouncedFunctionReturn<Args> {
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const cancelDebounce = useCallback(() => {
		if (timeoutIdRef.current !== undefined) {
			clearTimeout(timeoutIdRef.current);
		}

		timeoutIdRef.current = undefined;
	}, []);

	const debounceTimeRef = useRef(debounceTimeoutMs);
	useEffect(() => {
		debounceTimeRef.current = debounceTimeoutMs;
	}, [debounceTimeoutMs]);

	const callbackRef = useRef(callback);
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Returned-out function will always be synchronous, even if the callback arg
	// is async. Seemed dicey to try awaiting a genericized operation that can and
	// will likely be canceled repeatedly
	const debounced = useCallback(
		(...args: Args): void => {
			cancelDebounce();

			timeoutIdRef.current = setTimeout(
				() => void callbackRef.current(...args),
				typeof debounceTimeRef.current === "function"
					? debounceTimeRef.current(...args)
					: debounceTimeRef.current,
			);
		},
		[cancelDebounce],
	);

	return { debounced, cancelDebounce } as const;
}

/**
 * 接受任意值，并返回其防抖版本。
 */
export function useDebouncedValue<T>(value: T, debounceTimeoutMs: number): T {
	if (!Number.isInteger(debounceTimeoutMs) || debounceTimeoutMs < 0) {
		throw new Error(
			`debounceTimeoutMs 的值 ${debounceTimeoutMs} 无效。该值必须是大于或等于零的整数。`,
		);
	}

	const [debouncedValue, setDebouncedValue] = useState(value);

	// If the debounce timeout is ever zero, synchronously flush any state syncs.
	// Doing this mid-render instead of in useEffect means that we drastically cut
	// down on needless re-renders, and we also avoid going through the event loop
	// to do a state sync that is *intended* to happen immediately
	if (value !== debouncedValue && debounceTimeoutMs === 0) {
		setDebouncedValue(value);
	}
	useEffect(() => {
		if (debounceTimeoutMs === 0) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, debounceTimeoutMs);
		return () => clearTimeout(timeoutId);
	}, [value, debounceTimeoutMs]);

	return debouncedValue;
}
