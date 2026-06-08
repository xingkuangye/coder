/**
 * @file 一个封装 WebSocket 的包装器，用于 (1) 强制单向通信，(2) 支持在对端收到 JSON 消息时自动解析。
 *
 * 在需要做单向通信时，应始终优先使用这个包装器，而不是服务端发送事件（Server-Sent Events）和内置的
 * EventSource 类。SSE 在 HTTP/1.1 及以下版本中有一个硬限制：每个域名最多只能同时使用 6 个端口
 * （有时根据浏览器不同会更少）。这个限制不仅与短生命周期的 REST 请求共享，而且还会跨标签页和
 * 窗口生效。因此如果用户同时在多个标签页中打开 Coder，应用程序的某些部分极有可能开始卡死，
 * 而完全看不出原因。
 *
 * WebSocket 没有这个限制，即使在 HTTP/1.1 下也是如此——所有现代浏览器都会对 WebSocket 实现
 * 一定程度的多路复用。
 */

// Not bothering with trying to borrow methods from the base WebSocket type
// because it's already a mess of inheritance and generics, and we're going to
// have to add a few more
export type WebSocketEventType = "close" | "error" | "message" | "open";

export type OneWayMessageEvent<TData> = Readonly<
	| {
			sourceEvent: MessageEvent<string>;
			parsedMessage: TData;
			parseError: undefined;
	  }
	| {
			sourceEvent: MessageEvent<string>;
			parsedMessage: undefined;
			parseError: Error;
	  }
>;

type OneWayEventPayloadMap<TData> = {
	close: CloseEvent;
	error: Event;
	message: OneWayMessageEvent<TData>;
	open: Event;
};

type WebSocketMessageCallback = (payload: MessageEvent<string>) => void;

type OneWayEventCallback<TData, TEvent extends WebSocketEventType> = (
	payload: OneWayEventPayloadMap<TData>[TEvent],
) => void;

export interface OneWayWebSocketApi<TData> {
	get url(): string;

	addEventListener: <TEvent extends WebSocketEventType>(
		eventType: TEvent,
		callback: OneWayEventCallback<TData, TEvent>,
	) => void;

	removeEventListener: <TEvent extends WebSocketEventType>(
		eventType: TEvent,
		callback: OneWayEventCallback<TData, TEvent>,
	) => void;

	close: (closeCode?: number, reason?: string) => void;
}

type OneWayWebSocketInit = Readonly<{
	apiRoute: string;
	serverProtocols?: string | string[];
	searchParams?: Record<string, string> | URLSearchParams;
	binaryType?: BinaryType;
	websocketInit?: (url: string, protocols?: string | string[]) => WebSocket;
	location?: Readonly<{
		protocol: string;
		host: string;
	}>;
}>;

function defaultInit(url: string, protocols?: string | string[]): WebSocket {
	return new WebSocket(url, protocols);
}

export class OneWayWebSocket<TData = unknown>
	implements OneWayWebSocketApi<TData>
{
	readonly #socket: WebSocket;
	readonly #errorListeners = new Set<(e: Event) => void>();
	readonly #messageListenerWrappers = new Map<
		OneWayEventCallback<TData, "message">,
		WebSocketMessageCallback
	>();

	constructor(init: OneWayWebSocketInit) {
		const {
			apiRoute,
			searchParams,
			serverProtocols,
			binaryType = "blob",
			location = window.location,
			websocketInit = defaultInit,
		} = init;

		if (
			!apiRoute.startsWith("/api/v2/") &&
			!apiRoute.startsWith("/api/experimental")
		) {
			throw new Error(
				`API route '${apiRoute}' does not begin with '/api/v2/' or '/api/experimental'`,
			);
		}

		const formattedParams =
			searchParams instanceof URLSearchParams
				? searchParams
				: new URLSearchParams(searchParams);
		const paramsString = formattedParams.toString();
		const paramsSuffix = paramsString ? `?${paramsString}` : "";
		const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
		const url = `${wsProtocol}//${location.host}${apiRoute}${paramsSuffix}`;

		this.#socket = websocketInit(url, serverProtocols);
		this.#socket.binaryType = binaryType;
	}

	get url(): string {
		return this.#socket.url;
	}

	addEventListener<TEvent extends WebSocketEventType>(
		event: TEvent,
		callback: OneWayEventCallback<TData, TEvent>,
	): void {
		if (this.#socket.readyState === WebSocket.CLOSED) {
			return;
		}

		// Not happy about all the type assertions, but there are some nasty
		// type contravariance issues if you try to resolve the function types
		// properly. This is actually the lesser of two evils
		const looseCallback = callback as OneWayEventCallback<
			TData,
			WebSocketEventType
		>;

		// WebSockets automatically handle de-duping callbacks, but we have to
		// do a separate check for the wrappers
		if (this.#messageListenerWrappers.has(looseCallback)) {
			return;
		}
		if (event !== "message") {
			this.#socket.addEventListener(event, looseCallback);
			if (event === "error") {
				this.#errorListeners.add(looseCallback);
			}
			return;
		}

		const wrapped = (event: MessageEvent<string>): void => {
			const messageCallback = looseCallback as OneWayEventCallback<
				TData,
				"message"
			>;

			try {
				const message = JSON.parse(event.data) as TData;
				messageCallback({
					sourceEvent: event,
					parseError: undefined,
					parsedMessage: message,
				});
			} catch (err) {
				messageCallback({
					sourceEvent: event,
					parseError: err as Error,
					parsedMessage: undefined,
				});
			}
		};

		this.#socket.addEventListener(event as "message", wrapped);
		this.#messageListenerWrappers.set(looseCallback, wrapped);
	}

	removeEventListener<TEvent extends WebSocketEventType>(
		event: TEvent,
		callback: OneWayEventCallback<TData, TEvent>,
	): void {
		const looseCallback = callback as OneWayEventCallback<
			TData,
			WebSocketEventType
		>;

		if (event !== "message") {
			this.#socket.removeEventListener(event, looseCallback);
			if (event === "error") {
				this.#errorListeners.delete(looseCallback);
			}
			return;
		}
		if (!this.#messageListenerWrappers.has(looseCallback)) {
			return;
		}

		const wrapper = this.#messageListenerWrappers.get(looseCallback);
		if (wrapper === undefined) {
			throw new Error(
				`Cannot unregister callback for event ${event}. This is likely an issue with the browser itself.`,
			);
		}

		this.#socket.removeEventListener(event as "message", wrapper);
		this.#messageListenerWrappers.delete(looseCallback);
	}

	close(closeCode?: number, reason?: string): void {
		// Eject all error event listeners, mainly for ergonomics in React dev
		// mode. React's StrictMode will create additional connections to ensure
		// there aren't any render bugs, but manually closing a connection via a
		// cleanup function sometimes causes error events to get dispatched for
		// a connection that is no longer wired up to the UI
		for (const cb of this.#errorListeners) {
			this.#socket.removeEventListener("error", cb);
			this.#errorListeners.delete(cb);
		}

		this.#socket.close(closeCode, reason);
	}
}
