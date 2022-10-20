import React, {PropsWithChildren} from 'react';
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	withTiming,
} from 'react-native-reanimated';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import ThemedIcon from '../theme/ThemedIcon';
import {VSpace} from './Space';

interface ToastProps {
	message: string;
	show: boolean;
	icon?: string;
}

export function Toast({message, show, icon}: ToastProps) {
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
			<ToastTextContainer>
				{icon != null && (
					<>
						<ThemedIcon name={icon} size={14} />
						<VSpace size={6} />
					</>
				)}
				<ToastText>{message}</ToastText>
			</ToastTextContainer>
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

const ToastTextContainer = styled.View`
	flex-direction: row;
	align-items: center;
`;

const ToastText = styled.Text`
	color: ${(p) => p.theme.timer.text};
	font-weight: 500;
	font-family: Inter;
	text-align: center;
`;

export function ToastContainer({children}: PropsWithChildren) {
	const insets = useSafeAreaInsets();
	return <ToastContainerBase insets={insets}>{children}</ToastContainerBase>;
}

interface ToastContainerBaseProps {
	insets: EdgeInsets;
}

const ToastContainerBase = styled.View<ToastContainerBaseProps>`
	position: absolute;
	top: ${({insets}) => insets.top}px;
	left: ${({insets}) => insets.left}px;
	right: ${({insets}) => insets.right}px;
`;
