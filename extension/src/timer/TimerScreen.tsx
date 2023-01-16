import {useCallback, useEffect} from 'react';
import {faUndo, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useUser} from '../auth/UserProvider';
import Button from '../components/Button';
import {useBestHoursMemory} from '../history/useBestHoursMemory';
import {
	getIntervalsFromHistory,
	useHistoryMemory,
} from '../history/useHistoryMemory';
import Timer from './Timer';
import TimerFluidAnimation from './TimerFluidAnimation';
import {useTimerStage} from './TimerStageProvider';
import {useTimerMemory} from './useTimerMemory';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

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

	const {width, height} = useTimerScreenDimensions();

	return (
		<div className="relative" style={{width, height}}>
			<section className="absolute inset-0 flex">
				<TimerFluidAnimation
					isActive={isActive}
					isFocus={isFocus}
					pause={false}
				/>
			</section>
			<section className="absolute inset-0 p-4 flex flex-col">
				<header className="flex justify-end items-center h-10">
					<Button>Sign in</Button>
				</header>
				<main className="flex-1 flex justify-center items-center">
					<div className="relative w-48 h-48">
						<button
							onClick={handlePlayPause}
							className="absolute inset-0 flex justify-center items-center hover:opacity-75 active:opacity-50">
							<Timer seconds={secondsRemaining} />
						</button>
					</div>
				</main>
				<footer className="flex justify-between items-center h-10 ">
					<button className="p-2 hover:opacity-75 active:opacity-50">
						<FontAwesomeIcon icon={faUndo} className="w-6 h-6 text-text-base" />
					</button>
					<button className="p-2 hover:opacity-75 active:opacity-50">
						<FontAwesomeIcon
							icon={faArrowRight}
							className="w-6 h-6 text-text-base"
						/>
					</button>
				</footer>
			</section>
		</div>
	);
}
