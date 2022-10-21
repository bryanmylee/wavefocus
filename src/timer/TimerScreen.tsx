import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {useUser} from '../auth/UserProvider';
import Centered from '../components/Centered';
import Fade from '../components/Fade';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import {VSpace} from '../components/Space';
import * as ZStack from '../components/ZStack';
import ThemedIcon from '../theme/ThemedIcon';
import FocusReviewSelect from './FocusReviewSelect';
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

	const insets = useSafeAreaInsets();

	const [reviewIndex, setReviewIndex] = useState(1);

	return (
		<ZStack.Container flex={1}>
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
						<Centered>
							{user == null || isLoading ? (
								<ActivityIndicator color={theme.timer.text} />
							) : (
								<TouchableOpacity
									onPress={handlePlayPause}
									disabled={secondsRemaining === 0}>
									<Timer
										seconds={secondsRemaining}
										timerStage={timerStage}
										skipResetProgress={skipResetProgress}
									/>
								</TouchableOpacity>
							)}
						</Centered>
					</AnimatedFixedSafeAreaView>
				</TimerHorizontalPanHandler>
			</ZStack.Item>
			<BottomBar insets={insets} style={barAnim} pointerEvents="box-none">
				<Fade when={timerStage === 'focus' && secondsRemaining === 0}>
					<FocusReviewSelect
						currentIndex={reviewIndex}
						onCurrentIndexChange={setReviewIndex}
					/>
				</Fade>
				<VSpace size={32} />
				<BottomActionContainer pointerEvents="box-none">
					<Fade when={canReset} fallback={<IconPlaceholder />} duration={250}>
						<TouchableOpacity onPress={handleReset}>
							<ThemedIcon name="undo" size={42} color={theme.text.base} />
						</TouchableOpacity>
					</Fade>
					<Fade when={canSkip} fallback={<IconPlaceholder />} duration={250}>
						<TouchableOpacity onPress={handleNext}>
							<ThemedIcon
								name="arrow-right"
								size={42}
								color={theme.text.base}
							/>
						</TouchableOpacity>
					</Fade>
				</BottomActionContainer>
			</BottomBar>
		</ZStack.Container>
	);
}

const AnimatedFixedSafeAreaView =
	Animated.createAnimatedComponent(FixedSafeAreaView);

interface BottomBarProps {
	insets: EdgeInsets;
}

const BottomBar = Animated.createAnimatedComponent(styled.View<BottomBarProps>`
	position: absolute;
	bottom: ${({insets}) => insets.bottom}px;
	left: ${({insets}) => insets.left}px;
	right: ${({insets}) => insets.right}px;
`);

const BottomActionContainer = styled.View`
	flex-direction: row;
	justify-content: space-between;
	margin-left: 48px;
	margin-right: 48px;
	margin-bottom: 32px;
`;

const IconPlaceholder = styled.View`
	width: 42px;
	height: 42px;
`;
