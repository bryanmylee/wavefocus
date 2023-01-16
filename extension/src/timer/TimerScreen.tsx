import {useCallback, useEffect} from 'react';
import {faUndo, faArrowRight, faUser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import clsx from 'classnames';
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
	onShowSignInPage?: () => void;
	onPlay?: () => void;
}

export default function TimerScreen({
	onShowSignInPage,
	onPlay,
}: TimerScreenProps) {
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
		<div className="flex" style={{width, height}}>
			<div
				className={clsx(
					'flex-1 relative transition-opacity duration-1000 ease-in-out',
					user == null || isLoading ? 'opacity-0' : 'opacity-100',
				)}>
				<section className="absolute inset-0 flex">
					<TimerFluidAnimation isActive={isActive} isFocus={isFocus} />
				</section>
				<section className="absolute inset-0 p-4 flex flex-col">
					<header className="flex justify-end items-center h-10">
						<button
							onClick={onShowSignInPage}
							className="p-2 hover:opacity-75 active:opacity-50">
							<FontAwesomeIcon
								icon={faUser}
								className="w-6 h-6 text-text-base"
							/>
						</button>
					</header>
					<main className="flex-1 flex justify-center items-center">
						<button
							onClick={handlePlayPause}
							className="flex justify-center items-center hover:opacity-75 active:opacity-50">
							<Timer seconds={secondsRemaining} isFocus={isFocus} />
						</button>
					</main>
					<footer className="flex justify-between items-center h-10 ">
						{isActive ? null : (
							<>
								<button
									onClick={handleReset}
									className="p-2 hover:opacity-75 active:opacity-50">
									<FontAwesomeIcon
										icon={faUndo}
										className="w-6 h-6 text-text-base"
									/>
								</button>
								<button
									onClick={handleNext}
									className="p-2 hover:opacity-75 active:opacity-50">
									<FontAwesomeIcon
										icon={faArrowRight}
										className="w-6 h-6 text-text-base"
									/>
								</button>
							</>
						)}
					</footer>
				</section>
			</div>
		</div>
	);
}
