import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import {useUser} from '../auth/UserProvider';
import Centered from '../components/Centered';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import * as ZStack from '../components/ZStack';
import ThemedIcon from '../theme/ThemedIcon';
import Timer from './Timer';
import {TimerFluidAnimation} from './TimerFluidAnimation';
import TimerHorizontalPanHandler from './TimerHorizontalPanHandler';
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

	const canReset = !isActive && !isReset;
	const handleReset = useCallback(() => {
		if (canReset) {
			resetStage(false);
		}
	}, [canReset, resetStage]);

	const canSkip = !isActive;
	const handleNext = useCallback(() => {
		if (canSkip) {
			nextStage(isDone);
		}
	}, [canSkip, isDone, nextStage]);

	const handlePlayPause = useCallback(() => {
		if (!isActive) {
			onPlay?.();
		}
		toggleActive();
	}, [toggleActive, onPlay, isActive]);

	const theme = useTheme();

	const skipResetProgress = useSharedValue(0);
	const barAnim = useAnimatedStyle(() => ({
		opacity: withSpring(skipResetProgress.value === 0 ? 1 : 0),
	}));

	return (
		<ZStack.Container>
			<ZStack.Item>
				<TimerFluidAnimation isActive={isActive} timerStage={timerStage} />
			</ZStack.Item>
			<ZStack.Item>
				<TimerHorizontalPanHandler
					skipResetProgress={skipResetProgress}
					canSkip={canSkip}
					onSkip={handleNext}
					canReset={canReset}
					onReset={handleReset}>
					<AnimatedFixedSafeAreaView>
						{user == null || isLoading ? (
							<Centered>
								<ActivityIndicator color={theme.timer.text} />
							</Centered>
						) : (
							<>
								<Bar style={barAnim}>
									<IconPlaceholder />
								</Bar>
								<Centered>
									<TouchableOpacity onPress={handlePlayPause}>
										<Timer
											seconds={secondsRemaining}
											timerStage={timerStage}
											skipResetProgress={skipResetProgress}
										/>
									</TouchableOpacity>
								</Centered>
								<Bar style={barAnim}>
									{canReset ? (
										<TouchableOpacity onPress={handleReset}>
											<ThemedIcon name="undo" size={42} />
										</TouchableOpacity>
									) : (
										<IconPlaceholder />
									)}
									{canSkip ? (
										<TouchableOpacity onPress={handleNext}>
											<ThemedIcon name="arrow-right" size={42} />
										</TouchableOpacity>
									) : (
										<IconPlaceholder />
									)}
								</Bar>
							</>
						)}
					</AnimatedFixedSafeAreaView>
				</TimerHorizontalPanHandler>
			</ZStack.Item>
		</ZStack.Container>
	);
}

const AnimatedFixedSafeAreaView =
	Animated.createAnimatedComponent(FixedSafeAreaView);

const Bar = Animated.createAnimatedComponent(styled.View`
	flex-direction: row;
	justify-content: space-between;
	margin-left: 48px;
	margin-right: 48px;
	margin-bottom: 32px;
`);

const IconPlaceholder = styled.View`
	width: 42px;
	height: 42px;
`;
