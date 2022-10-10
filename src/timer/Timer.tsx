import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import * as ZStack from '../components/ZStack';
import {TimerStage} from './types';

const FOCUS_DURATION_SEC = 25 * 60;
const RELAX_DURATION_SEC = 5 * 60;
const MAX_PROGRESS = 0.9995;

export interface TimerProps {
	seconds: number;
	timerStage: TimerStage;
}

export default function Timer({seconds, timerStage}: TimerProps) {
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
	const progress = useSharedValue(MAX_PROGRESS);

	useEffect(
		function updateProgress() {
			progress.value = withTiming(Math.min(MAX_PROGRESS, seconds / duration), {
				duration: 1000,
			});
		},
		[progress, seconds, duration],
	);
	const circleAnimProps = useAnimatedProps(
		() => ({
			strokeDashoffset: circumference * progress.value,
		}),
		[circumference],
	);

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
