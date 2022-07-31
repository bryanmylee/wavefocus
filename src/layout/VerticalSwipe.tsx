import React, {PropsWithChildren} from 'react';
import {useWindowDimensions} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
	useAnimatedGestureHandler,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

type TPanGestureContext = {
	initialY: number;
};

export interface VerticalSwipeNavigatorProps extends PropsWithChildren {
	showAlt: boolean;
}

function Navigator({showAlt, children}: VerticalSwipeNavigatorProps) {
	const {height} = useWindowDimensions();
	const screenContainerAnim = useAnimatedStyle(
		() => ({
			transform: [{translateY: withSpring(showAlt ? height : 0)}],
		}),
		[showAlt, height],
	);

	const handlePanGesture = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		TPanGestureContext
	>({});

	return (
		<PanGestureHandler onGestureEvent={handlePanGesture}>
			<ScreenContainer style={screenContainerAnim}>{children}</ScreenContainer>
		</PanGestureHandler>
	);
}

const ScreenContainer = styled(Animated.View)`
	flex: 1;
`;

interface VerticalSwipeScreenProps extends PropsWithChildren {
	isAlt?: boolean;
}

function Screen({children, isAlt = false}: VerticalSwipeScreenProps) {
	const {height} = useWindowDimensions();
	return (
		<Container windowHeight={height} isAlt={isAlt}>
			{children}
		</Container>
	);
}

interface ContainerProps {
	windowHeight: number;
	isAlt: boolean;
}

const Container = styled.View<ContainerProps>`
	position: absolute;
	width: 100%;
	height: ${({windowHeight}) => windowHeight}px;
	bottom: ${({isAlt, windowHeight}) => (isAlt ? windowHeight : 0)}px;
`;

export default {
	Navigator,
	Screen,
};
