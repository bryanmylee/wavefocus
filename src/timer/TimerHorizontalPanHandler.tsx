import React, {PropsWithChildren} from 'react';
import {useWindowDimensions} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
	Easing,
	runOnJS,
	SharedValue,
	useAnimatedGestureHandler,
	withTiming,
} from 'react-native-reanimated';
import {useSimultaneousGestures} from '../layout/useSimultaneousGestures';
import {clampWorklet} from '../utils/clamp';

interface TimerHorizontalPanHandlerProps extends PropsWithChildren {
	skipResetProgress: SharedValue<number>;
	onReset?: () => void;
	onSkip?: () => void;
}

const PROGRESS_RANGE_FACTOR = 0.3;

export default function TimerHorizontalPanHandler({
	skipResetProgress,
	onReset,
	onSkip,
	children,
}: TimerHorizontalPanHandlerProps) {
	const {width} = useWindowDimensions();

	const handlePanGesture =
		useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
			onStart() {
				skipResetProgress.value = withTiming(0, {
					duration: 300,
					easing: Easing.out(Easing.quad),
				});
			},
			onActive(ev) {
				const dx = clampWorklet(ev.translationX, -width, width);
				const progressRange = width * PROGRESS_RANGE_FACTOR;
				skipResetProgress.value = -dx / progressRange;
			},
			onEnd() {
				if (skipResetProgress.value <= -1) {
					if (onReset != null) {
						runOnJS(onReset)();
					}
				} else if (skipResetProgress.value >= 1) {
					if (onSkip != null) {
						runOnJS(onSkip)();
					}
				}
				skipResetProgress.value = withTiming(0, {
					duration: 300,
					easing: Easing.out(Easing.quad),
				});
			},
		});

	const [gestureRef, otherGestures] =
		useSimultaneousGestures('timerHorizontalPan');

	return (
		<PanGestureHandler
			ref={gestureRef}
			onGestureEvent={handlePanGesture}
			simultaneousHandlers={otherGestures}
			enableTrackpadTwoFingerGesture
			activeOffsetX={[-50, 50]}>
			{children}
		</PanGestureHandler>
	);
}
