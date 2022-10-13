import React, {PropsWithChildren} from 'react';
import {useWindowDimensions} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
	SharedValue,
	useAnimatedGestureHandler,
	useSharedValue,
} from 'react-native-reanimated';
import {useSimultaneousGestures} from '../layout/useSimultaneousGestures';
import {clampWorklet} from '../utils/clamp';

type PanGestureContext = {
	initialX: number;
};

interface TimerHorizontalPanHandlerProps extends PropsWithChildren {
	skipProgress: SharedValue<number>;
}

export default function TimerHorizontalPanHandler({
	skipProgress,
	children,
}: TimerHorizontalPanHandlerProps) {
	const {width} = useWindowDimensions();

	const translateX = useSharedValue(0);
	const handlePanGesture = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		PanGestureContext
	>({
		onStart(_, ctx) {
			ctx.initialX = translateX.value;
			console.log('start');
		},
		onActive(ev, ctx) {
			translateX.value = clampWorklet(ctx.initialX + ev.translationX, 0, width);
			const toSkip = translateX.value > width / 2;
			console.log(translateX.value, 'skip?', toSkip);
		},
		onEnd(ev) {
			const toSkip = translateX.value > width / 2;
			console.log('skip?', toSkip);
		},
	});

	const [gestureRef, otherGestures] =
		useSimultaneousGestures('timerHorizontalPan');

	return (
		<PanGestureHandler
			ref={gestureRef}
			onGestureEvent={handlePanGesture}
			simultaneousHandlers={otherGestures}>
			{children}
		</PanGestureHandler>
	);
}
