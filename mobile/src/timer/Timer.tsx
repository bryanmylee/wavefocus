import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	Extrapolate,
	interpolate,
	SharedValue,
	useAnimatedProps,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import Svg, {Circle} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import Fade from '../components/Fade';
import * as ZStack from '../components/ZStack';
import {FOCUS_DURATION_SEC, RELAX_DURATION_SEC} from '../constants';
import ThemedIcon from '../theme/ThemedIcon';
import {clampWorklet} from '../utils/clamp';

const MIN_PROGRESS = 0.0005;

export interface TimerProps {
	seconds: number;
	isFocus: boolean;
	skipResetProgress: SharedValue<number>;
}

export default function Timer({
	seconds,
	isFocus,
	skipResetProgress,
}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');

	const theme = useTheme();

	const {width, height} = useWindowDimensions();
	const size = Math.min(width, height);
	const diameter = size * 0.75;
	const strokeWidth = size * 0.036;
	const radius = diameter / 2 - strokeWidth;
	const paddedDiameter = 120 + diameter;
	const circumference = Math.PI * 2 * radius;

	const duration = isFocus ? FOCUS_DURATION_SEC : RELAX_DURATION_SEC;
	const progress = useSharedValue(0);

	useEffect(
		function updateProgress() {
			progress.value = withTiming(Math.max(0, 1 - seconds / duration), {
				duration: 1000,
			});
		},
		[progress, seconds, duration],
	);

	const trigger = useSharedValue(0);
	useDerivedValue(() => {
		const targetValue = Math.abs(skipResetProgress.value) >= 1 ? 1 : 0;
		trigger.value = withSpring(targetValue, {
			mass: 0.1,
		});
	});

	const containerAnim = useAnimatedStyle(() => {
		return {
			transform: [
				{translateX: -40 * skipResetProgress.value},
				{scale: 1 + trigger.value * 0.1},
			],
			opacity: 1 - trigger.value * 0.5,
		};
	});

	const resetAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				skipResetProgress.value,
				[-1, -0.3],
				[1, 0],
				Extrapolate.CLAMP,
			),
		};
	});

	const nextAnim = useAnimatedStyle(() => {
		return {
			opacity: interpolate(
				skipResetProgress.value,
				[0.3, 1],
				[0, 1],
				Extrapolate.CLAMP,
			),
		};
	});

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
		<Container size={paddedDiameter} style={containerAnim}>
			<ResetIndicatorContainer style={resetAnim}>
				<ThemedIcon name="undo" size={42} />
			</ResetIndicatorContainer>
			<NextIndicatorContainer style={nextAnim}>
				<ThemedIcon name="arrow-right" size={42} />
			</NextIndicatorContainer>
			<ZStackCenteredItem>
				<Svg style={{transform: [{rotate: '-90deg'}]}}>
					<Circle
						cx={paddedDiameter / 2}
						cy={paddedDiameter / 2}
						r={radius}
						strokeWidth={strokeWidth}
						stroke={theme.timer.progressTrack}
						opacity={theme.timer.progressTrackOpacity}
					/>
					<AnimatedCircle
						cx={paddedDiameter / 2}
						cy={paddedDiameter / 2}
						r={radius}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						stroke={theme.timer.progressFill}
						strokeDasharray={circumference}
						animatedProps={circleAnimProps}
					/>
				</Svg>
			</ZStackCenteredItem>
			<ZStackCenteredItem>
				<Fade
					when={seconds !== 0}
					fallback={<ThemedIcon size={60} name="check" />}>
					<TimerText size={size}>
						{minutePart}:{secondPart}
					</TimerText>
				</Fade>
			</ZStackCenteredItem>
		</Container>
	);
}

interface ContainerProps {
	size: number;
}

const Container = Animated.createAnimatedComponent(styled(
	ZStack.Container,
)<ContainerProps>`
	width: ${(p) => p.size}px;
	height: ${(p) => p.size}px;
`);

const ZStackCenteredItem = styled(ZStack.Item)`
	justify-content: center;
	align-items: center;
`;

const ResetIndicatorContainer = Animated.createAnimatedComponent(styled.View`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	justify-content: center;
`);

const NextIndicatorContainer = Animated.createAnimatedComponent(styled.View`
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	justify-content: center;
`);

interface TimerTextProps {
	size: number;
}

const TimerText = styled.Text<TimerTextProps>`
	font-family: Inter;
	font-size: ${({size}) => size * 0.14}px;
	font-weight: 700;
	color: ${({theme}) => theme.timer.text};
`;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
