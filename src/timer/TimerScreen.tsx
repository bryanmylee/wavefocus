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
import {useVerticalSwipeScreenContext} from '../components/VerticalSwipe';
import * as ZStack from '../components/ZStack';
import {useHistoryMemory} from '../history/useHistoryMemory';
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
		isReset,
		isFocus,
		nextStage,
		resetStage,
	} = useTimerMemory();
	const {updateHistoryOnActiveChange} = useHistoryMemory();

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

	const handlePlayPause = useCallback(() => {
		const newActive = !isActive;
		if (newActive) {
			onPlay?.();
		}
		toggleActive();
		updateHistoryOnActiveChange({
			isActive: newActive,
			isFocus,
			secondsRemaining,
		});
	}, [
		toggleActive,
		onPlay,
		isActive,
		updateHistoryOnActiveChange,
		isFocus,
		secondsRemaining,
	]);

	const theme = useTheme();

	const skipResetProgress = useSharedValue(0);
	const barAnim = useAnimatedStyle(() => ({
		opacity: withSpring(skipResetProgress.value === 0 ? 1 : 0),
	}));

	const insets = useSafeAreaInsets();

	const {visible} = useVerticalSwipeScreenContext();

	const [reviewIndex, setReviewIndex] = useState(1);

	return (
		<ZStack.Container flex={1}>
			<ZStack.Item>
				<TimerFluidAnimation
					isActive={isActive}
					isFocus={isFocus}
					pause={!visible}
				/>
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
										isFocus={isFocus}
										skipResetProgress={skipResetProgress}
									/>
								</TouchableOpacity>
							)}
						</Centered>
					</AnimatedFixedSafeAreaView>
				</TimerHorizontalPanHandler>
			</ZStack.Item>
			<BottomBar insets={insets} style={barAnim} pointerEvents="box-none">
				<Fade when={isFocus && secondsRemaining === 0}>
					<FocusReviewSelect
						currentIndex={reviewIndex}
						onCurrentIndexChange={setReviewIndex}
					/>
				</Fade>
				<VSpace size={32} />
				<BottomActionContainer pointerEvents="box-none">
					<Fade when={canReset} fallback={<IconPlaceholder />} duration={250}>
						<TouchableOpacity onPress={handleReset}>
							<ThemedIcon name="undo" size={42} color={theme.primary} />
						</TouchableOpacity>
					</Fade>
					<Fade when={canSkip} fallback={<IconPlaceholder />} duration={250}>
						<TouchableOpacity onPress={handleNext}>
							<ThemedIcon name="arrow-right" size={42} color={theme.primary} />
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
