/**
 * @file 共享 WebSocket 重连工具，采用有上限的指数退避策略。
 * 聊天列表监听器（AgentsPage）和单聊流监听器（ChatContext）
 * 均使用相同的“断开即重连”模式。本模块将这一逻辑提取为
 * 一个可复用的函数，以便两个调用点保持同步，并且退避
 * 数学计算集中在一处。
 *
 * @example
 * ```ts
 * const dispose = createReconnectingWebSocket({
 *   connect() {
 *     const ws = watchChats();
 *     ws.addEventListener("message", (e) => handleMessage(e));
 *     return ws;
 *   },
 *   onOpen() {
 *     console.log("connected");
 *   },
 *   onDisconnect(reconnect) {
 *     console.log(
 *       `disconnected, reconnecting in ${reconnect.delayMs}ms`,
 *     );
 *   },
 * });
 *
 * // Later, to tear down:
 * dispose();
 * ```
 */

/** 指数退避的默认基准延迟（毫秒）。 */
const RECONNECT_BASE_MS = 1_000;

/** 指数退避的默认最大延迟上限（毫秒）。 */
const RECONNECT_MAX_MS = 10_000;

/** 每次重试时应用于基准延迟的默认倍数。 */
const RECONNECT_FACTOR = 2;

/**
 * 应用于计算后的重连延迟的默认对称抖动。
 * `0.3` 表示最终延迟会在基准指数退避值的 ±30% 范围内随机化。
 */
const RECONNECT_JITTER = 0.3;

/**
 * 刚刚安排的重连尝试的元数据。
 * `attempt` 从 1 开始计数，面向用户：`1` 表示连接断开后的第一次重试。
 */
export type ReconnectSchedule = {
	attempt: number;
	delayMs: number;
	retryingAt: string;
};

/**
 * 一个最小的类 WebSocket 接口，重连工具可以对其进行管理。
 * 原生 `WebSocket` 和 `OneWayWebSocket` 都满足此契约。
 */
interface Closable {
	addEventListener(event: string, handler: (...args: unknown[]) => void): void;
	close(...args: unknown[]): void;
}

/**
 * {@link createReconnectingWebSocket} 的配置选项。
 *
 * @typeParam TSocket - `connect` 函数返回的具体套接字类型
 *   （例如 `OneWayWebSocket<ServerSentEvent>`）。
 */
interface ReconnectingWebSocketOptions<TSocket extends Closable> {
	/**
	 * 创建并返回新套接字的工厂函数。在初始连接以及每次重连
	 * 尝试时调用。调用方负责在返回的套接字上附加 `message`
	 * 监听器 —— 该工具仅管理生命周期事件（`open`、`close`、`error`）。
	 */
	connect: () => TSocket;

	/**
	 * 连接成功（套接字触发 `open`）时调用。退避计数器
	 * 在此回调执行前重置。
	 */
	onOpen?: (socket: TSocket) => void;

	/**
	 * 在首次断开（成功连接后）或连接失败时调用。每个套接字
	 * 实例最多触发一次（浏览器会同时触发 `error` 和 `close`；
	 * 仅转发第一个事件）。回调将收到刚刚安排的重连尝试信息。
	 */
	onDisconnect?: (reconnect: ReconnectSchedule) => void;

	/** 基准延迟（毫秒）。默认值为 {@link RECONNECT_BASE_MS}。 */
	baseMs?: number;

	/**
	 * 重连延迟的硬性上限（毫秒）。抖动应用于已限制的退避基准值，
	 * 因此最终延迟不会超过此值。
	 */
	maxMs?: number;

	/** 每次尝试的倍数。默认值为 {@link RECONNECT_FACTOR}。 */
	factor?: number;

	/**
	 * 应用于计算后延迟的对称抖动。`0.3` 表示最终延迟可在
	 * 基准指数退避值的 ±30% 范围内变化。设为 `0` 可保留
	 * 精确的原有时间逻辑。值会被钳制到 `[0, 1]` 区间；
	 * 非有限值将被视为 `0`。
	 */
	jitter?: number;

	/**
	 * 用于抖动的随机数源。默认为 `Math.random`，
	 * 主要作为确定性的测试接缝存在。输出会被归一化到
	 * `[0, 1]` 区间；非有限值会回退到 `0.5`。
	 */
	random?: () => number;
}

const normalizeUnitInterval = (value: number, fallback: number): number =>
	Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : fallback;

const normalizeDelayMs = (value: number, fallback: number): number =>
	Number.isFinite(value) ? Math.max(0, value) : fallback;

const applyReconnectJitter = ({
	delayMs,
	jitter,
	random,
}: {
	delayMs: number;
	jitter: number;
	random: () => number;
}): number => {
	const safeJitter = normalizeUnitInterval(jitter, 0);
	if (safeJitter <= 0) {
		return delayMs;
	}
	const safeRandom = normalizeUnitInterval(random(), 0.5);
	const jitterOffset = (safeRandom * 2 - 1) * safeJitter;
	return normalizeDelayMs(Math.round(delayMs * (1 + jitterOffset)), delayMs);
};

const getReconnectSchedule = ({
	attempt,
	baseMs,
	maxMs,
	factor,
	jitter,
	random,
}: {
	attempt: number;
	baseMs: number;
	maxMs: number;
	factor: number;
	jitter: number;
	random: () => number;
}): ReconnectSchedule => {
	const safeMaxMs = normalizeDelayMs(maxMs, 0);
	const rawDelayMs = normalizeDelayMs(
		baseMs * factor ** (attempt - 1),
		safeMaxMs,
	);
	const cappedDelayMs = Math.min(rawDelayMs, safeMaxMs);
	const jitteredDelayMs = applyReconnectJitter({
		delayMs: cappedDelayMs,
		jitter,
		random,
	});
	const delayMs = Math.min(jitteredDelayMs, safeMaxMs);
	return {
		attempt,
		delayMs,
		retryingAt: new Date(Date.now() + delayMs).toISOString(),
	};
};

/**
 * 创建一个带上限指数退避的自动重连 WebSocket 连接。
 *
 * 返回的函数用于销毁连接：它会关闭当前活跃的套接字（如果有），
 * 取消任何待执行的重连定时器，并阻止后续的重连尝试。多次
 * 调用该销毁函数也是安全的。
 *
 * 退避延迟公式：
 * ```
 * rawDelay = baseMs * factor ^ (attempt - 1)
 * cappedDelay = min(rawDelay, maxMs)
 * jitteredDelay = round(cappedDelay * (1 + offset))
 * delay = min(jitteredDelay, maxMs)
 * offset ∈ [-jitter, +jitter]
 * ```
 *
 * 重连尝试计数器在成功 `open` 后重置。
 *
 * @returns 用于拆除连接的销毁函数。
 */
export function createReconnectingWebSocket<TSocket extends Closable>(
	options: ReconnectingWebSocketOptions<TSocket>,
): () => void {
	const {
		connect: connectFn,
		onOpen,
		onDisconnect,
		baseMs = RECONNECT_BASE_MS,
		maxMs = RECONNECT_MAX_MS,
		factor = RECONNECT_FACTOR,
		jitter = RECONNECT_JITTER,
		random = Math.random,
	} = options;

	let disposed = false;
	let lastReconnectAttempt = 0;
	let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	let activeSocket: TSocket | null = null;

	const scheduleReconnect = (reconnect: ReconnectSchedule) => {
		if (disposed) {
			return;
		}
		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
		}
		lastReconnectAttempt = reconnect.attempt;
		reconnectTimer = setTimeout(connect, reconnect.delayMs);
	};

	function connect() {
		reconnectTimer = null;
		if (disposed) {
			return;
		}
		if (activeSocket) {
			activeSocket.close();
		}

		const socket = connectFn();
		activeSocket = socket;

		const handleOpen = () => {
			// Connection succeeded — reset backoff.
			lastReconnectAttempt = 0;
			onOpen?.(socket);
		};

		const handleDisconnect = () => {
			// Guard against duplicate calls: browsers fire both "error"
			// and "close" on a failed WebSocket, so we only process the
			// first event per socket instance.
			if (activeSocket !== socket || disposed) {
				return;
			}
			activeSocket = null;
			const reconnect = getReconnectSchedule({
				attempt: lastReconnectAttempt + 1,
				baseMs,
				maxMs,
				factor,
				jitter,
				random,
			});
			onDisconnect?.(reconnect);
			scheduleReconnect(reconnect);
		};

		socket.addEventListener("open", handleOpen);
		socket.addEventListener("error", handleDisconnect);
		socket.addEventListener("close", handleDisconnect);
	}

	// Kick off the first connection.
	connect();

	// Return a dispose function that tears everything down.
	return () => {
		disposed = true;
		if (reconnectTimer !== null) {
			clearTimeout(reconnectTimer);
		}
		if (activeSocket) {
			activeSocket.close();
		}
	};
}

