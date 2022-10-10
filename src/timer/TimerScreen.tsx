import React, {useCallback, useEffect} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import LoginButton from '../auth/LoginButton';
import {useUser} from '../auth/UserProvider';
import FixedSafeAreaView from '../core/FixedSafeAreaView';
import NextButton from './NextButton';
import ResetButton from './ResetButton';
import Timer from './Timer';
import {useTimerStage} from './TimerStageProvider';
import {useTimerMemory} from './useTimerMemory';

export interface TimerScreenProps {
	onPressLoginButton?: () => void;
}

export default function TimerScreen({onPressLoginButton}: TimerScreenProps) {
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
		<FixedSafeAreaView>
			<TopBar>
				<LoginButton
					isLoggedIn={!user?.isAnonymous ?? false}
					onPress={onPressLoginButton}
				/>
			</TopBar>
			<TimerContainer>
				<TouchableOpacity onPress={handlePlayPausePress}>
					<Timer seconds={secondsRemaining} />
				</TouchableOpacity>
			</TimerContainer>
			<BottomBar>
				{!isActive && !isReset ? (
					<ResetButton onPress={handleResetPress} />
				) : (
					<IconPlaceholder />
				)}
				{!isActive ? (
					<NextButton onPress={handleNextPress} />
				) : (
					<IconPlaceholder />
				)}
			</BottomBar>
		</FixedSafeAreaView>
	);
}

const TopBar = styled.View`
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 28px;
	padding-right: 28px;
	padding-top: 32px;
`;

const TimerContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
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
