import {useEffect} from 'react';
import {
	cancelAnimation,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';

interface UseOscillatingValueProps {
	from: number;
	to: number;
	cycleMs: number;
	pause?: boolean;
}

export function useOscillatingValue({
	from,
	to,
	cycleMs,
	pause = false,
}: UseOscillatingValueProps) {
	const progress = useSharedValue(from);
	useEffect(() => {
		cancelAnimation(progress);
		if (pause) {
			return;
		}
		progress.value = withRepeat(
			withSequence(
				withTiming(to, {duration: cycleMs}),
				withTiming(from, {duration: cycleMs}),
			),
			-1,
			true,
		);
	}, [from, to, cycleMs, progress, pause]);
	return progress;
}
