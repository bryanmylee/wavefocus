import React, {useEffect, useState} from 'react';
import {EasingFunction} from 'react-native';
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

interface FadeProps extends React.PropsWithChildren {
	when: boolean;
	fallback?: React.ReactNode;
	duration?: number;
	easing?: EasingFunction;
}

export default function Fade({
	when,
	children,
	fallback,
	duration = 500,
	easing = Easing.inOut(Easing.cubic),
}: FadeProps) {
	const [visible, setVisible] = useState(when);
	const opacity = useSharedValue(0);
	useEffect(
		function immediatelyMakeVisible() {
			if (when) {
				setVisible(true);
			}
		},
		[when],
	);
	useEffect(
		function updateOpacity() {
			opacity.value = withTiming(
				when ? 1 : 0,
				{
					duration,
					easing,
				},
				() => {
					runOnJS(setVisible)(when);
				},
			);
		},
		[when, duration, easing, opacity],
	);
	const viewAnim = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));
	return (
		<>
			{visible ? (
				<Animated.View style={viewAnim}>{children}</Animated.View>
			) : (
				fallback
			)}
		</>
	);
}
