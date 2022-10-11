import React, {
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
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

const VerticalSwipeNavigatorContext = React.createContext<{
	mainVisible: boolean;
	altVisible: boolean;
}>({
	altVisible: true,
	mainVisible: true,
});

export interface VerticalSwipeNavigatorProps extends PropsWithChildren {
	showAlt: boolean;
	onUpdateShowAlt: (showAlt: boolean) => void;
}

export function Navigator({
	showAlt,
	onUpdateShowAlt,
	children,
}: VerticalSwipeNavigatorProps) {
	const startTransition = useCallback(() => {
		setMainVisible(true);
		setAltVisible(true);
	}, []);

	const endTransition = useCallback((onAlt: boolean) => {
		setMainVisible(!onAlt);
		setAltVisible(onAlt);
	}, []);

	const [mainVisible, setMainVisible] = useState(!showAlt);
	const [altVisible, setAltVisible] = useState(showAlt);

	const {height} = useWindowDimensions();
	const translateY = useSharedValue(0);
	useEffect(
		function updateTranslateYOnShowAlt() {
			translateY.value = withSpring(
				showAlt ? height : 0,
				{
					damping: 20,
					overshootClamping: true,
				},
				() => {
					runOnJS(endTransition)(showAlt);
				},
			);
		},
		[height, showAlt, translateY, endTransition],
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
			runOnJS(startTransition)();
		},
		onActive(event, context) {
			translateY.value = clampWorklet(
				context.initialY + event.translationY,
				0,
				height,
			);
		},
		onFail(event) {
			const toShowAlt = translateY.value + event.velocityY > height / 2;
			runOnJS(endTransition)(toShowAlt);
		},
		onEnd(event) {
			const toShowAlt = translateY.value + event.velocityY > height / 2;
			runOnJS(onUpdateShowAlt)(toShowAlt);
			const targetY = toShowAlt ? height : 0;
			translateY.value = withSpring(
				targetY,
				{
					damping: 20,
					velocity: event.velocityY,
					overshootClamping: true,
				},
				() => {
					runOnJS(endTransition)(toShowAlt);
				},
			);
		},
	});

	return (
		<VerticalSwipeNavigatorContext.Provider
			value={{
				mainVisible,
				altVisible,
			}}>
			<PanGestureHandler onGestureEvent={handlePanGesture}>
				<NavigatorScreensContainer style={screensContainerAnim}>
					{children}
				</NavigatorScreensContainer>
			</PanGestureHandler>
		</VerticalSwipeNavigatorContext.Provider>
	);
}

const NavigatorScreensContainer = styled(Animated.View)`
	flex: 1;
`;

interface VerticalSwipeScreenProps extends PropsWithChildren {
	forceMount?: boolean;
	isAlt?: boolean;
}

export function Screen({
	children,
	forceMount = false,
	isAlt = false,
}: VerticalSwipeScreenProps) {
	const {height} = useWindowDimensions();
	const {mainVisible, altVisible} = useContext(VerticalSwipeNavigatorContext);
	return (
		<ScreenContainer windowHeight={height} isAlt={isAlt}>
			{(forceMount || (isAlt && altVisible) || (!isAlt && mainVisible)) &&
				children}
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
