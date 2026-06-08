const CHIME_PREFERENCE_KEY = "agents.chime-on-completion";

export function getChimeEnabled(): boolean {
	try {
		const stored = localStorage.getItem(CHIME_PREFERENCE_KEY);
		// Default to disabled when no preference has been saved.
		return stored === null ? false : stored === "true";
	} catch {
		return false;
	}
}

export function setChimeEnabled(enabled: boolean): void {
	try {
		localStorage.setItem(CHIME_PREFERENCE_KEY, String(enabled));
	} catch {
		// Silently ignore storage errors (e.g. private browsing
		// quota exceeded).
	}
}

/**
 * Play the completion chime audio file. The file is a short,
 * warm two-tone bell sound shipped as a static asset.
 *
 * A single Audio element is reused across calls so the browser
 * only fetches the file once.
 */
let chimeAudio: HTMLAudioElement | null = null;

/** @internal Reset cached Audio state between tests. */
export function _resetForTesting(): void {
	chimeAudio = null;
}

function playChimeAudio(): void {
	try {
		if (!chimeAudio) {
			chimeAudio = new Audio("/chime.mp3");
			chimeAudio.volume = 0.5;
		}
		// Reset to the start in case a previous play hasn't
		// finished yet.
		chimeAudio.currentTime = 0;
		void chimeAudio.play();
	} catch {
		// Silently ignore playback errors (e.g. autoplay policy
		// blocks, missing file, etc.).
	}
}

// -- Cross-tab chime deduplication via Web Locks API ----------
//
// When multiple tabs are open on /agents, every tab receives the
// same WebSocket status transitions and would independently
// decide to play the chime. We use navigator.locks to acquire a
// short-lived, per-chatID lock. Only the tab that successfully
// acquires the lock plays the sound. The lock is held for a
// short duration to prevent other tabs from acquiring it for the
// same event.
//
// Falls back to always playing (original single-tab behavior)
// when the Web Locks API is unavailable.

/**
 * 播放提示音后持有锁的时长（毫秒）。这样可以避免其他标签页中稍晚到达的同一转换事件也获取到锁。
 */
export const LOCK_HOLD_MS = 2000;

/**
 * 跨标签页协调，使仅有一个标签页为指定的 chatID 播放提示音。
 * 使用 navigator.locks.request()，并设置 ifAvailable: true ——
 * 首个获取到锁的标签页会播放，而其他标签页会静默跳过。
 * 锁会保持 LOCK_HOLD_MS 毫秒，以覆盖其他标签页收到相同 WebSocket 事件的窗口期。
 *
 * 当 Web Locks API 不可用时，将回退为立即播放（保持原始单标签页行为）。
 */
function playChime(chatID: string): void {
	if (typeof navigator === "undefined" || !navigator.locks) {
		playChimeAudio();
		return;
	}

	const lockName = `coder-agent-chime:${chatID}`;

	void navigator.locks.request(
		lockName,
		{ ifAvailable: true },
		async (lock) => {
			if (!lock) {
				// Another tab already holds the lock for this
				// chatID — skip playback.
				return;
			}

			playChimeAudio();

			// Hold the lock briefly so that tabs receiving the
			// WebSocket event a bit later will see the lock as
			// held and skip.
			await new Promise((resolve) => setTimeout(resolve, LOCK_HOLD_MS));
		},
	);
}

/**
 * 检查聊天状态的转换是否应触发提示音，并在需要时进行播放。
 * 提示音会在以下转换中触发：
 *
 *   running → waiting   （通过 per-chat WS 的正常完成）
 *   running → pending   （通过 per-chat WS 的正常完成）
 *   pending → waiting   （watchChats WS 跳过了 "running" 状态）
 *
 * 注意，"pending" 同时作为源状态和目标状态出现：
 * 当代理排队时它是一个活跃状态，代理完成后它也是一个休眠状态。
 * 如果用户当前正在查看该聊天，则不会播放提示音。
 */
export function maybePlayChime(
	prevStatus: string | undefined,
	nextStatus: string,
	chatID: string,
	activeChatID: string | undefined,
): void {
	if (prevStatus === nextStatus) {
		return;
	}

	// Terminal states that indicate the agent finished.
	const isTerminal = nextStatus === "waiting" || nextStatus === "pending";
	if (!isTerminal) {
		return;
	}

	// Only chime when transitioning from a non-terminal state.
	// "running" is the expected previous state, but "pending" can
	// appear when the watchChats WebSocket skips the intermediate
	// "running" status (it only publishes the final state change).
	const wasActive = prevStatus === "running" || prevStatus === "pending";
	if (!wasActive) {
		return;
	}

	// Skip when the user is looking at this exact chat.
	const isViewingThisChat = !document.hidden && chatID === activeChatID;
	if (isViewingThisChat) {
		return;
	}

	if (!getChimeEnabled()) {
		return;
	}

	playChime(chatID);
}
