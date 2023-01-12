import {useCallback, useEffect, useState} from 'react';

export function useMediaQuery(query: string): boolean {
	const getMatches = useCallback(
		(query: string) => {
			// Prevents SSR issues
			if (typeof window !== 'undefined') {
				return window.matchMedia(query).matches;
			}
			return false;
		},
		[query],
	);

	const [matches, setMatches] = useState(getMatches(query));

	const handleChange = useCallback(() => {
		setMatches(getMatches(query));
	}, [getMatches, query]);

	useEffect(
		function subscribeQuery() {
			const matchMedia = window.matchMedia(query);

			// Triggered at the first client-side load and if query changes
			handleChange();

			matchMedia.addEventListener('change', handleChange);

			return () => {
				matchMedia.removeEventListener('change', handleChange);
			};
		},
		[query, handleChange],
	);

	return matches;
}
