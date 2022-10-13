import React, {PropsWithChildren} from 'react';
import {useWindowDimensions} from 'react-native';
import {
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
	runOnJS,
	SharedValue,
	useAnimatedGestureHandler,
} from 'react-native-reanimated';
import {useSimultaneousGestures} from '../layout/useSimultaneousGestures';
import {clampWorklet} from '../utils/clamp';

interface TimerHorizontalPanHandlerProps extends PropsWithChildren {
	skipResetProgress: SharedValue<number>;
	onReset?: () => void;
	onSkip?: () => void;
}

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
				skipResetProgress.value = 0;
			},
			onActive(ev) {
				const dx = clampWorklet(ev.translationX, -width, width);
				const progressRange = width / 4;
				skipResetProgress.value = dx / progressRange;
			},
			onEnd() {
				if (skipResetProgress.value >= 1) {
					if (onReset != null) {
						runOnJS(onReset)();
					}
				} else if (skipResetProgress.value <= -1) {
					if (onSkip != null) {
						runOnJS(onSkip)();
					}
				}
				skipResetProgress.value = 0;
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
