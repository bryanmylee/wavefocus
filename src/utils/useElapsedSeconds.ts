import {useCallback, useEffect, useRef, useState} from 'react';

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

export function useElapsedSeconds(
	startMs: number | null,
	pauseMs: number | null,
	maxDurationSec: number,
) {
	const prevTimestamp = useRef(Date.now());
	const [msElapsed, setMsElapsed] = useState(() =>
		startMs == null ? 0 : prevTimestamp.current - startMs,
	);

	const timeout = useRef<NodeJS.Timeout>();
	const stopTimeout = useCallback(() => {
		if (timeout.current == null) {
			return;
		}
		clearTimeout(timeout.current);
		timeout.current = undefined;
	}, []);

	const runner = useCallback(() => {
		const now = Date.now();
		const elapsed = startMs == null ? 0 : now - startMs;
		const drift = clamp(elapsed % 1000, 800, 1200);
		timeout.current = setTimeout(runner, 1000 - drift);
		prevTimestamp.current = now;
		if (Math.floor(elapsed / 1000) >= maxDurationSec) {
			setMsElapsed(maxDurationSec * 1000);
			stopTimeout();
		} else {
			setMsElapsed(elapsed);
		}
	}, [startMs, maxDurationSec, stopTimeout]);

	useEffect(
		function updateMsElapsed() {
			if (pauseMs != null) {
				stopTimeout();
				setMsElapsed(startMs == null ? 0 : pauseMs - startMs);
			} else if (timeout.current == null) {
				const now = Date.now();
				prevTimestamp.current = now;
				const elapsed = startMs == null ? 0 : now - startMs;
				const offset = elapsed % 1000;
				timeout.current = setTimeout(runner, 1000 - offset);
				return stopTimeout;
			}
		},
		[startMs, pauseMs, stopTimeout, runner],
	);

	return Math.floor(msElapsed / 1000);
}
