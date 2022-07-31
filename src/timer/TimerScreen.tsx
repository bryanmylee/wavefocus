import React, {useCallback, useEffect} from 'react';
import styled from 'styled-components/native';
import LoginButton from '../auth/LoginButton';
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
		<SafeArea>
			<TopBar>
				<LoginButton isLoggedIn={!user?.isAnonymous ?? false} />
			</TopBar>
			<TimerContainer>
				<Timer seconds={secondsRemaining} />
			</TimerContainer>
			<BottomBar>
				{!isActive && !isReset ? (
					<ResetButton onPress={handleResetPress} />
				) : (
					<IconPlaceholder />
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
					<IconPlaceholder />
				)}
			</BottomBar>
		</SafeArea>
	);
}

const SafeArea = styled.SafeAreaView`
	flex: 1;
`;

const TimerContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
`;

const TopBar = styled.View`
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 28px;
	padding-right: 28px;
	padding-top: 32px;
`;

const BottomBar = styled.View`
	flex-direction: row;
	justify-content: space-between;
	padding-left: 48px;
	padding-right: 48px;
	padding-bottom: 32px;
`;

const IconPlaceholder = styled.View`
	width: 42px;
	height: 42px;
`;
