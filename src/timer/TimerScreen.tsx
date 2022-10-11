import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import styled, {useTheme} from 'styled-components/native';
import {useUser} from '../auth/UserProvider';
import {Centered} from '../components/Centered';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import * as ZStack from '../components/ZStack';
import ThemedIcon from '../theme/ThemedIcon';
import Timer from './Timer';
import {TimerFluidAnimation} from './TimerFluidAnimation';
import {useTimerStage} from './TimerStageProvider';
import {useTimerMemory} from './useTimerMemory';

export interface TimerScreenProps {
	onPressLoginButton?: () => void;
}

export default function TimerScreen({}: TimerScreenProps) {
	const {user, isLoading} = useUser();
	const {
		isActive,
		toggleActive,
		secondsRemaining,
		isDone,
		isReset,
		timerStage,
		nextStage,
		resetStage,
	} = useTimerMemory();

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

	const theme = useTheme();

	return (
		<Container>
			<ZStack.Item>
				<TimerFluidAnimation isActive={isActive} timerStage={timerStage} />
			</ZStack.Item>
			<ZStack.Item>
				<FixedSafeAreaView>
					{user == null || isLoading ? (
						<Centered>
							<ActivityIndicator color={theme.timer.text} />
						</Centered>
					) : (
						<>
							<Bar>
								<IconPlaceholder />
							</Bar>
							<Centered>
								<TouchableOpacity onPress={handlePlayPausePress}>
									<Timer seconds={secondsRemaining} timerStage={timerStage} />
								</TouchableOpacity>
							</Centered>
							<Bar>
								{!isActive && !isReset ? (
									<TouchableOpacity onPress={handleResetPress}>
										<ThemedIcon name="undo" size={42} />
									</TouchableOpacity>
								) : (
									<IconPlaceholder />
								)}
								{!isActive ? (
									<TouchableOpacity onPress={handleNextPress}>
										<ThemedIcon name="arrow-right" size={42} />
									</TouchableOpacity>
								) : (
									<IconPlaceholder />
								)}
							</Bar>
						</>
					)}
				</FixedSafeAreaView>
			</ZStack.Item>
		</Container>
	);
}

const Container = styled(ZStack.Container)`
	flex: 1;
`;

const Bar = styled.View`
	flex-direction: row;
	justify-content: space-between;
	padding-left: 48px;
	padding-right: 48px;
`;

const IconPlaceholder = styled.View`
	width: 42px;
	height: 42px;
`;
