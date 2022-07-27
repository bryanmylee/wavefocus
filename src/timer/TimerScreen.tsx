import React, {useCallback, useEffect} from 'react';
import styled from 'styled-components/native';
import {useUser} from '../auth/UserProvider';
import NextButton from './NextButton';
import PlayPauseButton from './PlayPauseButton';
import ResetButton from './ResetButton';
import Timer from './Timer';
import {useTimerStage} from './TimerStageProvider';
import {useTimerMemory} from './useTimerMemory';

export default function TimerScreen() {
	const {user} = useUser();
	const {
		isActive,
		toggleActive,
		secondsRemaining,
		isDone,
		isReset,
		timerStage,
		nextStage,
		resetStage,
	} = useTimerMemory(user?.uid ?? '');

	const [, setAppTimerStage] = useTimerStage();
	useEffect(
		function synchronizeAppTimerStage() {
			setAppTimerStage(timerStage);
		},
		[timerStage, setAppTimerStage],
	);

	const handleResetPress = useCallback(() => {
		resetStage(false);
	}, [resetStage]);

	const handleNextPress = useCallback(() => {
		nextStage(isDone);
	}, [isDone, nextStage]);

	const handlePlayPausePress = useCallback(() => {
		toggleActive();
	}, [toggleActive]);

	return (
		<>
			<TimerContainer>
				<Timer seconds={secondsRemaining} />
			</TimerContainer>
			<BottomBar>
				{!isActive && !isReset ? (
					<ResetButton onPress={handleResetPress} />
				) : (
					<BottomBarPlaceholder />
				)}
				{isDone ? (
					<NextButton onPress={handleNextPress} />
				) : (
					<PlayPauseButton
						onPress={handlePlayPausePress}
						isActive={isActive}
						isDone={isDone}
					/>
				)}
				{!isActive && !isDone ? (
					<NextButton onPress={handleNextPress} />
				) : (
					<BottomBarPlaceholder />
				)}
			</BottomBar>
		</>
	);
}

const TimerContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
`;

const BottomBar = styled.View`
	flex-direction: row;
	justify-content: space-between;
	padding: 64px;
`;

const BottomBarPlaceholder = styled.View`
	width: 42px;
	height: 42px;
`;
