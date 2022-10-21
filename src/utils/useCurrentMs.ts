import {useCallback, useEffect, useState} from 'react';

export function useCurrentMs(resolutionMs: number) {
	const [ms, setMs] = useState(Date.now);

	const updateMs = useCallback(() => {
		setMs(Date.now());
	}, []);

	useEffect(
		function setupInterval() {
			const interval = setInterval(updateMs, resolutionMs);
			return () => clearInterval(interval);
		},
		[updateMs, resolutionMs],
	);

	return ms;
}
