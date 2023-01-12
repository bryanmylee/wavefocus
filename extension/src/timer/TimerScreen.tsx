import {useCallback, useEffect} from 'react';
import {useUser} from '../auth/UserProvider';
import {useBestHoursMemory} from '../history/useBestHoursMemory';
import {
	getIntervalsFromHistory,
	useHistoryMemory,
} from '../history/useHistoryMemory';
import Timer from './Timer';
import {useTimerStage} from './TimerStageProvider';
import {useTimerMemory} from './useTimerMemory';

export interface TimerScreenProps {
	onPlay?: () => void;
}

export default function TimerScreen({onPlay}: TimerScreenProps) {
	const {user, isLoading} = useUser();
	const {
		isActive,
		toggleActive,
		secondsRemaining,
		isReset,
		isFocus,
		nextStage,
		resetStage,
	} = useTimerMemory();
	const {updateHistoryOnActiveChange} = useHistoryMemory();
	const {updateBestHoursOnActiveChange} = useBestHoursMemory();

	const [, setIsFocus] = useTimerStage();
	useEffect(
		function synchronizeAppTimerStage() {
			setIsFocus(isFocus);
		},
		[isFocus, setIsFocus],
	);

	const canReset = !isActive && !isReset;
	const handleReset = useCallback(() => {
		if (!canReset) {
			return;
		}
		resetStage();
	}, [canReset, resetStage]);

	const canSkip = !isActive;
	const handleNext = useCallback(() => {
		if (!canSkip) {
			return;
		}
		nextStage();
	}, [canSkip, nextStage]);

	const handlePlayPause = useCallback(async () => {
		const newActive = !isActive;
		if (newActive) {
			onPlay?.();
		}
		toggleActive();
		const newHistory = await updateHistoryOnActiveChange({
			isActive: newActive,
			isFocus,
			secondsRemaining,
		});
		if (newHistory == null) {
			return;
		}
		const intervals = getIntervalsFromHistory(newHistory.history);
		const latestInterval = intervals[intervals.length - 1];
		if (latestInterval != null) {
			updateBestHoursOnActiveChange({
				isActive: newActive,
				latestInterval,
			});
		}
	}, [
		toggleActive,
		onPlay,
		isActive,
		updateHistoryOnActiveChange,
		isFocus,
		secondsRemaining,
		updateBestHoursOnActiveChange,
	]);

	return (
		<section className="p-4 flex justify-center items-center w-64 h-96">
			<div className="relative w-48 h-48">
				<button
					onClick={handlePlayPause}
					className="absolute inset-0 flex justify-center items-center hover:opacity-80 active:opacity-50">
					<Timer seconds={secondsRemaining} />
				</button>
			</div>
		</section>
	);
}
