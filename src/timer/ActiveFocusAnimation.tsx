import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	Easing,
	interpolate,
	SharedValue,
	useAnimatedProps,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Circle} from 'react-native-svg';
import {useTheme} from 'styled-components/native';
import {useOscillatingValue} from '../utils/useOscillatingValue';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActiveFocusAnimationProps {
	show: boolean;
}

export default function ActiveFocusAnimation({
	show,
}: ActiveFocusAnimationProps) {
	const {width, height} = useWindowDimensions();
	const showProgress = useSharedValue(show ? 1 : 0);
	useEffect(
		function animateShow() {
			showProgress.value = show ? 1 : 0;
		},
		[showProgress, show],
	);
	const radius = Math.min(width, height) * 0.4;
	return (
		<>
			<FocusCircle radius={radius} showProgress={showProgress} cycleMs={1000} />
			<FocusCircle radius={radius} showProgress={showProgress} cycleMs={1333} />
			<FocusCircle radius={radius} showProgress={showProgress} cycleMs={1750} />
		</>
	);
}

interface FocusCircleProps {
	radius: number;
	showProgress: SharedValue<number>;
	cycleMs: number;
}

type Point = [number, number];
function getPointFromTheta(theta: number, d: number): Point {
	'worklet';
	return [d * Math.cos(theta), d * Math.sin(theta)];
}

function FocusCircle({radius, showProgress, cycleMs}: FocusCircleProps) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const {width, height} = useWindowDimensions();
	const cx = insets.left + (width - insets.left - insets.right) / 2;
	const cy = insets.top + (height - insets.top - insets.bottom) / 2;

	const theta = useOscillatingValue({
		from: 0,
		to: Math.PI * 4,
		cycleMs: cycleMs * 2,
	});
	const wiggleRadius = radius * 0.05;
	const wiggle = useDerivedValue(() =>
		getPointFromTheta(theta.value, wiggleRadius),
	);

	const scale = useDerivedValue(() =>
		withTiming(interpolate(showProgress.value, [0, 1], [0, 1]), {
			duration: 1000,
			easing: Easing.elastic(1),
		}),
	);

	const circleAnimProps = useAnimatedProps(() => ({
		r: radius * scale.value,
		cx: cx + wiggle.value[0],
		cy: cy + wiggle.value[1],
	}));

	return (
		<AnimatedCircle
			fill={theme.timer.fluidFill}
			opacity={theme.timer.fluidOpacity}
			animatedProps={circleAnimProps}
		/>
	);
}
