import {useEffect} from 'react';
import {useTimerStage} from '../timer/TimerStageProvider';
import {useColorScheme} from './useColorScheme';

export function useThemeBodyClassList() {
	const [isFocus] = useTimerStage();
	useEffect(
		function syncStageClass() {
			if (isFocus) {
				document.body.classList.remove('relax');
				document.body.classList.add('focus');
			} else {
				document.body.classList.remove('focus');
				document.body.classList.add('relax');
			}
		},
		[isFocus],
	);

	const scheme = useColorScheme();
	useEffect(
		function syncSchemeClass() {
			if (scheme === 'light') {
				document.body.classList.remove('dark');
			} else {
				document.body.classList.add('dark');
			}
		},
		[scheme],
	);
}
