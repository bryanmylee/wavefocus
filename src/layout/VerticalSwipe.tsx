import React, {PropsWithChildren, useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import styled from 'styled-components/native';
import {clampWorklet} from '../utils/clamp';

type TPanGestureContext = {
	initialY: number;
};

export interface VerticalSwipeNavigatorProps extends PropsWithChildren {
	showAlt: boolean;
	onUpdateShowAlt: (showAlt: boolean) => void;
}

function Navigator({
	showAlt,
	onUpdateShowAlt,
	children,
}: VerticalSwipeNavigatorProps) {
	const {height} = useWindowDimensions();
	const translateY = useSharedValue(0);
	useEffect(
		function updateTranslateYOnShowAlt() {
			translateY.value = withSpring(showAlt ? height : 0, {
				damping: 20,
				overshootClamping: true,
			});
		},
		[height, showAlt, translateY],
	);

	const screensContainerAnim = useAnimatedStyle(
		() => ({
			transform: [{translateY: translateY.value}],
		}),
		[showAlt, height],
	);

	const handlePanGesture = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		TPanGestureContext
	>({
		onStart(_, context) {
			context.initialY = translateY.value;
		},
		onActive(event, context) {
			translateY.value = clampWorklet(
				context.initialY + event.translationY,
				0,
				height,
			);
		},
		onEnd(event) {
			const toShowAlt = translateY.value + event.velocityY > height / 2;
			runOnJS(onUpdateShowAlt)(toShowAlt);
			const targetY = toShowAlt ? height : 0;
			translateY.value = withSpring(targetY, {
				damping: 20,
				velocity: event.velocityY,
				overshootClamping: true,
			});
		},
	});

	return (
		<PanGestureHandler onGestureEvent={handlePanGesture}>
			<NavigatorScreensContainer style={screensContainerAnim}>
				{children}
			</NavigatorScreensContainer>
		</PanGestureHandler>
	);
}

const NavigatorScreensContainer = styled(Animated.View)`
	flex: 1;
`;

interface VerticalSwipeScreenProps extends PropsWithChildren {
	isAlt?: boolean;
}

function Screen({children, isAlt = false}: VerticalSwipeScreenProps) {
	const {height} = useWindowDimensions();
	return (
		<ScreenContainer windowHeight={height} isAlt={isAlt}>
			{children}
		</ScreenContainer>
	);
}

interface ScreenContainerProps {
	windowHeight: number;
	isAlt: boolean;
}

const ScreenContainer = styled.View<ScreenContainerProps>`
	position: absolute;
	width: 100%;
	height: ${({windowHeight}) => windowHeight}px;
	bottom: ${({isAlt, windowHeight}) => (isAlt ? windowHeight : 0)}px;
`;

export default {
	Navigator,
	Screen,
};
