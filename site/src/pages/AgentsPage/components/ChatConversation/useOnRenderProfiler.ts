import { type ProfilerOnRenderCallback, useCallback, useRef } from "react";

// Threshold in milliseconds. Renders exceeding one frame budget
// (16.67ms at 60fps) are logged as warnings.
const SLOW_RENDER_THRESHOLD_MS = 16;

// Minimum interval between consecutive warnings for the same profiler
// id, to avoid flooding the console during rapid streaming updates.
const WARN_THROTTLE_MS = 2000;

// Cap the number of performance.measure entries to avoid unbounded
// memory growth during long streaming sessions. When the cap is
// reached, only this profiler's entries are cleared by name
// and counting restarts.
const MAX_MEASURE_ENTRIES = 500;

/**
 * 返回一个稳定的 onRender 回调，用于 React 的 <Profiler> 组件。
 * 每次渲染都会生成一个 performance.measure() 条目，可在浏览器开发者工具（包括 Safari 时间线）中查看。
 * 超过 SLOW_RENDER_THRESHOLD_MS 的渲染会额外输出一条 console.warn，包含时间细节（按 profiler id 节流）。
 *
 * 在标准生产构建中，React 不会调用含有时间数据的 onRender 回调，因此该 Hook 实际上不执行任何操作。
 * 只有在使用 react-dom/profiling 进行构建（通过 CODER_REACT_PROFILING=true 启用）时才会产生输出。
 */
export function useOnRenderProfiler(): ProfilerOnRenderCallback {
	const lastWarnTime = useRef(0);
	const measureCount = useRef(0);
	const measureNames = useRef(new Set<string>());

	return useCallback<ProfilerOnRenderCallback>(
		(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
			// In standard production builds the Profiler callback
			// receives zero for all timing values. Bail out early to
			// avoid creating garbage performance entries.
			if (actualDuration <= 0) {
				return;
			}

			// Emit a performance.measure entry for every render so
			// the Performance/Timeline panel shows the full render
			// timeline when investigating jank, not just outliers.
			const measureName = `⚛ ${id} (${phase})`;
			try {
				performance.measure(measureName, {
					start: startTime,
					duration: actualDuration,
				});
			} catch {
				// performance.measure can throw if startTime is invalid
				// (e.g. negative or before time origin). Safe to ignore.
			}
			measureNames.current.add(measureName);
			measureCount.current++;
			if (measureCount.current >= MAX_MEASURE_ENTRIES) {
				for (const name of measureNames.current) {
					performance.clearMeasures(name);
				}
				measureNames.current.clear();
				measureCount.current = 0;
			}

			if (actualDuration <= SLOW_RENDER_THRESHOLD_MS) {
				return;
			}

			const now = performance.now();
			if (now - lastWarnTime.current < WARN_THROTTLE_MS) {
				return;
			}
			lastWarnTime.current = now;

			// actualDuration covers the render phase only. The commit
			// offset (commitTime - startTime) includes yield/suspend
			// time in concurrent React, so it can be larger.
			console.warn(
				`[Slow render] %c${id}%c ${phase}: ` +
					`${actualDuration.toFixed(1)}ms actual, ` +
					`${baseDuration.toFixed(1)}ms base ` +
					`(commit ${(commitTime - startTime).toFixed(1)}ms after start)`,
				"font-weight: bold",
				"font-weight: normal",
			);
		},
		[],
	);
}
