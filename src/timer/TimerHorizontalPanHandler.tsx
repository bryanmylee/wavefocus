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
import {clampWorklet} from '../utils/clamp';

interface TimerHorizontalPanHandlerProps extends PropsWithChildren {
	skipResetProgress: SharedValue<number>;
	canSkip: boolean;
	onSkip: () => void;
	canReset: boolean;
	onReset: () => void;
}

const PROGRESS_RANGE_FACTOR = 0.3;

export default function TimerHorizontalPanHandler({
	skipResetProgress,
	canSkip,
	onSkip,
	canReset,
	onReset,
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
				let targetProgress = -dx / progressRange;
				if (!canSkip && targetProgress > 0) {
					return;
				}
				if (!canReset && targetProgress < 0) {
					return;
				}
				skipResetProgress.value = targetProgress;
			},
			onEnd() {
				if (skipResetProgress.value <= -1) {
					runOnJS(onReset)();
				} else if (skipResetProgress.value >= 1) {
					runOnJS(onSkip)();
				}
				skipResetProgress.value = withTiming(0, {
					duration: 300,
					easing: Easing.out(Easing.quad),
				});
			},
		});

	return (
		<PanGestureHandler
			onGestureEvent={handlePanGesture}
			enableTrackpadTwoFingerGesture
			activeOffsetX={[-50, 50]}>
			{children}
		</PanGestureHandler>
	);
}
