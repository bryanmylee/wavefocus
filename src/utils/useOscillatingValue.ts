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
}

export function useOscillatingValue({
	from,
	to,
	cycleMs,
}: UseOscillatingValueProps) {
	const progress = useSharedValue(from);
	useEffect(() => {
		cancelAnimation(progress);
		progress.value = withRepeat(
			withSequence(
				withTiming(to, {duration: cycleMs}),
				withTiming(from, {duration: cycleMs}),
			),
			-1,
			true,
		);
	}, [from, to, cycleMs, progress]);
	return progress;
}
