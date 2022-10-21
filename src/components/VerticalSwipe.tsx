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

type PanGestureContext = {
	initialY: number;
};

const VerticalSwipeNavigatorContext = React.createContext<{
	mainVisible: boolean;
	topVisible: boolean;
	bottomVisible: boolean;
}>({
	topVisible: true,
	mainVisible: true,
	bottomVisible: true,
});

export type ScreenType = 'top' | 'bottom' | 'main';

export interface VerticalSwipeNavigatorProps extends PropsWithChildren {
	screen: ScreenType;
	onChangeScreen: (screen: ScreenType) => void;
}

const getScreenFromTargetWorklet = (
	targetValue: number,
	screenHeight: number,
): ScreenType => {
	'worklet';
	if (targetValue > screenHeight / 2) {
		return 'top';
	}
	if (targetValue < -screenHeight / 2) {
		return 'bottom';
	}
	return 'main';
};

export function Navigator({
	screen,
	onChangeScreen: onChangeScreen,
	children,
}: VerticalSwipeNavigatorProps) {
	const startTransition = useCallback(() => {
		setMainVisible(true);
		setTopVisible(true);
		setBottomVisible(true);
	}, []);

	const endTransition = useCallback((newScreen: ScreenType) => {
		setMainVisible(newScreen === 'main');
		setTopVisible(newScreen === 'top');
		setBottomVisible(newScreen === 'bottom');
	}, []);

	const [mainVisible, setMainVisible] = useState(screen === 'main');
	const [topVisible, setTopVisible] = useState(screen === 'top');
	const [bottomVisible, setBottomVisible] = useState(screen === 'bottom');

	const {height} = useWindowDimensions();
	const translateY = useSharedValue(0);
	useEffect(
		function updateTranslateYOnShowTop() {
			translateY.value = withSpring(
				screen === 'main' ? 0 : screen === 'top' ? height : -height,
				{
					damping: 20,
					overshootClamping: true,
				},
				() => {
					runOnJS(endTransition)(screen);
				},
			);
		},
		[height, screen, translateY, endTransition],
	);

	const screensContainerAnim = useAnimatedStyle(() => ({
		transform: [{translateY: translateY.value}],
	}));

	const handlePanGesture = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		PanGestureContext
	>({
		onStart(_, ctx) {
			ctx.initialY = translateY.value;
			runOnJS(startTransition)();
		},
		onActive(ev, ctx) {
			translateY.value = clampWorklet(
				ctx.initialY + ev.translationY,
				-height,
				height,
			);
		},
		onFail(ev) {
			const targetValue =
				translateY.value + clampWorklet(ev.velocityY, -height, height);
			const screenToShow = getScreenFromTargetWorklet(targetValue, height);
			runOnJS(endTransition)(screenToShow);
		},
		onEnd(ev) {
			const targetValue =
				translateY.value + clampWorklet(ev.velocityY, -height, height);
			const screenToShow = getScreenFromTargetWorklet(targetValue, height);
			runOnJS(endTransition)(screenToShow);
			runOnJS(onChangeScreen)(screenToShow);
			const targetY =
				screenToShow === 'main' ? 0 : screenToShow === 'top' ? height : -height;
			translateY.value = withSpring(
				targetY,
				{
					damping: 20,
					velocity: ev.velocityY,
					overshootClamping: true,
				},
				() => {
					runOnJS(endTransition)(screenToShow);
				},
			);
		},
	});

	return (
		<VerticalSwipeNavigatorContext.Provider
			value={{
				mainVisible,
				topVisible,
				bottomVisible,
			}}>
			<PanGestureHandler
				onGestureEvent={handlePanGesture}
				enableTrackpadTwoFingerGesture
				activeOffsetY={[-50, 50]}>
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
	type?: ScreenType;
}

const VerticalSwipeScreenContext = React.createContext<{
	visible: boolean;
}>({
	visible: true,
});

export const useVerticalSwipeScreenContext = () =>
	useContext(VerticalSwipeScreenContext);

export function Screen({
	children,
	forceMount = false,
	type,
}: VerticalSwipeScreenProps) {
	const {height} = useWindowDimensions();
	const {mainVisible, topVisible, bottomVisible} = useContext(
		VerticalSwipeNavigatorContext,
	);
	const visible =
		(type === 'bottom' && bottomVisible) ||
		(type === 'top' && topVisible) ||
		(type === 'main' && mainVisible);
	return (
		<VerticalSwipeScreenContext.Provider value={{visible}}>
			<ScreenContainer windowHeight={height} type={type}>
				{(forceMount || visible) && children}
			</ScreenContainer>
		</VerticalSwipeScreenContext.Provider>
	);
}

interface ScreenContainerProps {
	windowHeight: number;
	type: ScreenType;
}

const ScreenContainer = styled.View<ScreenContainerProps>`
	position: absolute;
	width: 100%;
	height: ${({windowHeight}) => windowHeight}px;
	bottom: ${({type, windowHeight}) =>
		type === 'top' ? windowHeight : type === 'bottom' ? -windowHeight : 0}px;
`;
