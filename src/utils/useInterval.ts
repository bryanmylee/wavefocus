import {useCallback, useEffect, useRef} from 'react';

export const useInterval = (
	callback: () => void,
	ms?: number,
	isActive = true,
) => {
	const savedCallback = useRef(callback);

	useEffect(
		function updateCallback() {
			savedCallback.current = callback;
		},
		[callback],
	);

	let interval = useRef<number | undefined>(undefined);
	const stopInterval = useCallback(() => {
		if (interval.current !== undefined) {
			clearInterval(interval.current);
		}
		interval.current = undefined;
	}, []);

	useEffect(
		function updateInterval() {
			if (ms === undefined || !isActive) {
				stopInterval();
				return;
			}
			interval.current = setInterval(savedCallback.current, ms);
			return stopInterval;
		},
		[ms, isActive, stopInterval],
	);

	return stopInterval;
};
