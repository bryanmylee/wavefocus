import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	SharedValue,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import * as ZStack from '../components/ZStack';
import {clampWorklet} from '../utils/clamp';
import {TimerStage} from './types';

const FOCUS_DURATION_SEC = 25 * 60;
const RELAX_DURATION_SEC = 5 * 60;
const MIN_PROGRESS = 0.0005;

export interface TimerProps {
	seconds: number;
	timerStage: TimerStage;
	skipResetProgress: SharedValue<number>;
}

export default function Timer({
	seconds,
	timerStage,
	skipResetProgress,
}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');

	const theme = useTheme();

	const textAnim = useAnimatedStyle(
		() => ({
			color: withTiming(theme.timer.text),
		}),
		[theme.timer.text],
	);

	const {width, height} = useWindowDimensions();
	const size = Math.min(width, height);
	const diameter = size * 0.75;
	const strokeWidth = 15;
	const radius = diameter / 2 - strokeWidth;
	const circumference = Math.PI * 2 * radius;

	const duration =
		timerStage === 'focus' ? FOCUS_DURATION_SEC : RELAX_DURATION_SEC;
	const progress = useSharedValue(0);

	useEffect(
		function updateProgress() {
			progress.value = withTiming(Math.max(0, 1 - seconds / duration), {
				duration: 1000,
			});
		},
		[progress, seconds, duration],
	);

	const circleAnimProps = useAnimatedProps(() => {
		const remainingProgress = 1 - progress.value;
		let resolvedProgress = progress.value;
		if (skipResetProgress.value > 0) {
			resolvedProgress =
				progress.value + remainingProgress * skipResetProgress.value;
		} else if (skipResetProgress.value < 0) {
			resolvedProgress =
				progress.value + skipResetProgress.value * progress.value;
		}
		resolvedProgress = clampWorklet(resolvedProgress, MIN_PROGRESS, 1);
		return {
			strokeDashoffset: circumference * (1 - resolvedProgress),
		};
	}, [circumference]);

	return (
		<Container size={diameter}>
			<Item>
				<Svg style={{transform: [{rotate: '-90deg'}]}}>
					<Circle
						cx={diameter / 2}
						cy={diameter / 2}
						r={radius}
						strokeWidth={15}
						stroke={theme.timer.progressTrack}
						opacity={theme.timer.progressTrackOpacity}
					/>
					<AnimatedCircle
						cx={diameter / 2}
						cy={diameter / 2}
						r={radius}
						strokeWidth={15}
						strokeLinecap="round"
						stroke={theme.timer.progressFill}
						strokeDasharray={circumference}
						animatedProps={circleAnimProps}
					/>
				</Svg>
			</Item>
			<Item>
				<TimerText style={textAnim}>
					{minutePart}:{secondPart}
				</TimerText>
			</Item>
		</Container>
	);
}

interface ContainerProps {
	size: number;
}

const Container = styled(ZStack.Container)<ContainerProps>`
	width: ${(p) => p.size}px;
	height: ${(p) => p.size}px;
`;

const Item = styled(ZStack.Item)`
	justify-content: center;
	align-items: center;
`;

const TimerText = styled(Animated.Text)`
	font-family: Inter;
	font-size: 56px;
	font-weight: 700;
`;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
