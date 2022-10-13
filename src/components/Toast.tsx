import React from 'react';
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

interface ToastProps {
	message: string;
	show: boolean;
}

export default function Toast({message, show}: ToastProps) {
	const showProgress = useDerivedValue(
		() =>
			withTiming(show ? 1 : 0, {duration: 500, easing: Easing.elastic(0.8)}),
		[show],
	);
	const baseAnim = useAnimatedStyle(
		() => ({
			opacity: showProgress.value,
			transform: [
				{translateY: interpolate(showProgress.value, [0, 1], [-80, 0])},
			],
		}),
		[show],
	);
	return (
		<ToastBase style={baseAnim}>
			<ToastBackground />
			<ToastText>{message}</ToastText>
		</ToastBase>
	);
}

const ToastBase = Animated.createAnimatedComponent(styled.View`
	position: relative;
	padding-left: 16px;
	padding-right: 16px;
	padding-top: 10px;
	padding-bottom: 10px;
	margin-top: 16px;
	margin-left: auto;
	margin-right: auto;
	align-self: flex-start;
`);

const ToastBackground = styled.View`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	border-radius: 16px;
	background-color: ${(p) => p.theme.timer.fluidFill};
	opacity: ${(p) => p.theme.timer.fluidOpacity};
`;

const ToastText = styled.Text`
	color: ${(p) => p.theme.timer.text};
	font-size: 18px;
	font-weight: 500;
	font-family: Inter;
	text-align: center;
`;
