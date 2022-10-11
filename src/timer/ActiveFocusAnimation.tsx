import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	Easing,
	interpolate,
	SharedValue,
	useAnimatedProps,
	useDerivedValue,
	useSharedValue,
	withDelay,
	withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Circle} from 'react-native-svg';
import {useTheme} from 'styled-components/native';

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
			<FocusCircle radius={radius} showProgress={showProgress} />
			<FocusCircle radius={radius} showProgress={showProgress} delayMs={50} />
			<FocusCircle radius={radius} showProgress={showProgress} delayMs={100} />
		</>
	);
}

interface FocusCircleProps {
	radius: number;
	showProgress: SharedValue<number>;
	delayMs?: number;
}

function FocusCircle({radius, showProgress, delayMs = 0}: FocusCircleProps) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const {width, height} = useWindowDimensions();
	const cx = insets.left + (width - insets.left - insets.right) / 2;
	const cy = insets.top + (height - insets.top - insets.bottom) / 2;
	const scale = useDerivedValue(() =>
		withTiming(interpolate(showProgress.value, [0, 1], [0, 1]), {
			duration: 1000,
			easing: Easing.inOut(Easing.elastic(1.2)),
		}),
	);
	const dy = useDerivedValue(() =>
		withDelay(
			delayMs,
			withTiming(interpolate(showProgress.value, [0, 1], [-height / 1.5, 0]), {
				duration: 1000,
				easing: Easing.inOut(Easing.cubic),
			}),
		),
	);
	const circleAnimProps = useAnimatedProps(() => ({
		r: radius * scale.value,
		cy: cy + dy.value,
	}));
	return (
		<AnimatedCircle
			cx={cx}
			fill={theme.timer.fluidFill}
			opacity={theme.timer.fluidOpacity}
			animatedProps={circleAnimProps}
		/>
	);
}
