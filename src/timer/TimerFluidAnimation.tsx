import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	cancelAnimation,
	useAnimatedProps,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import styled, {useTheme} from 'styled-components/native';
import {TimerStage} from './types';

interface TimerFluidAnimationProps {
	isActive: boolean;
	timerStage: TimerStage;
}

export function TimerFluidAnimation({
	isActive,
	timerStage,
}: TimerFluidAnimationProps) {
	const {width, height} = useWindowDimensions();
	const theme = useTheme();
	return (
		<Container>
			<Svg>
				<AnimatedPath
					fill={theme.timer.fluidFill}
					opacity={theme.timer.fluidOpacity}
					animatedProps={useFluidPath({
						windowHeight: height,
						windowWidth: width,
						waveHeight: height / 5,
						isActive,
						timerStage,
						baseCycleMs: 5000,
					})}
				/>
				<AnimatedPath
					fill={theme.timer.fluidFill}
					opacity={theme.timer.fluidOpacity}
					animatedProps={useFluidPath({
						windowHeight: height,
						windowWidth: width,
						waveHeight: height / 5.5,
						isActive,
						timerStage,
						baseCycleMs: 3000,
					})}
				/>
				<AnimatedPath
					fill={theme.timer.fluidFill}
					opacity={theme.timer.fluidOpacity}
					animatedProps={useFluidPath({
						windowHeight: height,
						windowWidth: width,
						waveHeight: height / 5.75,
						isActive,
						timerStage,
						baseCycleMs: 4000,
					})}
				/>
			</Svg>
		</Container>
	);
}

const Container = styled.View`
	flex: 1;
`;

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface UseValueProps {
	from: number;
	to: number;
	cycleMs: number;
	delayMs?: number;
}

function useOscillatingValue({from, to, cycleMs}: UseValueProps) {
	const progress = useSharedValue(from);
	useEffect(() => {
		cancelAnimation(progress);
		progress.value = withRepeat(
			withSequence(
				withTiming(to, {duration: cycleMs}),
				withTiming(from, {duration: cycleMs}),
			),
			-1,
			true,
		);
	}, [from, to, cycleMs, progress]);
	return progress;
}

interface FluidPathProps {
	windowHeight: number;
	windowWidth: number;
	waveHeight: number;
	baseCycleMs: number;
	isActive: boolean;
	timerStage: TimerStage;
}

const useFluidPath = ({
	windowHeight,
	windowWidth,
	waveHeight,
	baseCycleMs,
	isActive,
	timerStage,
}: FluidPathProps) => {
	let cycleMs = baseCycleMs;
	if (timerStage === 'focus' && isActive) {
		cycleMs /= 3;
	}

	/**
	 * We need to ensure there are an equal number of points between the two SVG
	 * paths to interpolate between.
	 *
	 * The number of points is determined by how many wave crests are required to
	 * span the window and wrap back around.
	 */
	const dx = windowWidth / 3;
	const waveLength = windowWidth + dx;
	const numPoints = Math.ceil(waveLength / IDEAL_WAVE_WIDTH) + 2;

	const progress = useOscillatingValue({
		from: 0,
		to: -1,
		cycleMs,
	});
	const wavePoints = useDerivedValue(() =>
		getWavePoints({
			progress: progress.value,
			numPoints,
			windowWidth,
			windowHeight,
			waveHeight,
		}),
	);
	return useAnimatedProps(() => ({
		d: getPath(wavePoints.value),
	}));
};

type Point = [number, number];
type Curve = [number, number, number, number, number, number];
interface FluidPoints {
	start: Point;
	curves: Curve[];
}

const getPath = ({start, curves}: FluidPoints): string => {
	'worklet';
	return (
		'M' +
		start.join(',') +
		curves.map((curve) => 'c' + curve.join(',')).join('')
	);
};

interface WavePointsProps {
	progress: number;
	numPoints: number;
	windowWidth: number;
	windowHeight: number;
	waveHeight: number;
}

const IDEAL_WAVE_WIDTH = 200;

const getWavePoints = ({
	progress,
	numPoints,
	windowWidth,
	windowHeight,
	waveHeight,
}: WavePointsProps): FluidPoints => {
	'worklet';
	const dx = windowWidth / 3;
	const numPeaks = numPoints - 2;
	const peakHeight = waveHeight / 4;
	const waveLength = windowWidth + dx;
	const between = waveLength / numPeaks / 1.9;
	const curves: Curve[] = [];
	for (let i = 0; i < numPeaks; i++) {
		let y = peakHeight;
		if (i % 2 !== 0) {
			y *= -1;
		}
		curves.push([between, 0, between, y, IDEAL_WAVE_WIDTH, y]);
	}
	curves.push(
		[0, 0, 0, 0, 0, waveHeight + peakHeight],
		[0, 0, 0, 0, -numPeaks * IDEAL_WAVE_WIDTH, 0],
	);
	return {
		start: [dx * progress, windowHeight - waveHeight],
		curves,
	};
};
