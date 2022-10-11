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

interface UseOscillatingValueProps {
	from: number;
	to: number;
	cycleMs: number;
	delayMs?: number;
}

function useOscillatingValue({from, to, cycleMs}: UseOscillatingValueProps) {
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

function useFluidPath({
	windowHeight,
	windowWidth,
	waveHeight,
	baseCycleMs,
	isActive,
	timerStage,
}: FluidPathProps) {
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
		to: 1,
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
	const spherePoints = useDerivedValue(() =>
		getCirclePoints({
			progress: progress.value,
			numPoints,
			windowWidth,
			windowHeight,
			radius: Math.min(windowWidth, windowHeight) * 0.4,
		}),
	);
	return useAnimatedProps(() => ({
		d: getPath(spherePoints.value),
	}));
}

type Point = [number, number];
type Curve = [number, number, number, number, number, number];
interface FluidPoints {
	start: Point;
	curves: Curve[];
}

function getPath({start, curves}: FluidPoints): string {
	'worklet';
	return (
		'M' +
		start.join(',') +
		curves.map((curve) => 'c' + curve.join(',')).join('')
	);
}

interface WavePointsProps {
	progress: number;
	numPoints: number;
	windowWidth: number;
	windowHeight: number;
	waveHeight: number;
}

const IDEAL_WAVE_WIDTH = 200;

function getWavePoints({
	progress,
	numPoints,
	windowWidth,
	windowHeight,
	waveHeight,
}: WavePointsProps): FluidPoints {
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
		start: [-dx * progress, windowHeight - waveHeight],
		curves,
	};
}

interface CirclePointsProps {
	progress: number;
	numPoints: number;
	windowWidth: number;
	windowHeight: number;
	radius: number;
}

function getPointFromTheta(theta: number, d: number): Point {
	'worklet';
	return [d * Math.cos(theta), d * Math.sin(theta)];
}

/**
 * To approximate a circle of radius 1 with a Bezier curve with n segments, the
 * optimal distance to control points is d = (4/3)*tan(π/(2n)).
 *
 * For relative path syntax, all points are relative to the starting point.
 *
 * Given any point p and the next point in the anti-clockwise direction q:
 * - the first point is d on the anti-clockwise tangent to p.
 * - the second point is d on the clockwise tangent to q.
 * - the last point is on q.
 */
function getCirclePoints({
	progress,
	numPoints,
	windowWidth,
	windowHeight,
	radius,
}: CirclePointsProps): FluidPoints {
	'worklet';
	const wiggleRadius = radius * 0.05;
	const progressTheta = progress * Math.PI * 2;
	const [wiggleDx, wiggleDy] = getPointFromTheta(progressTheta, wiggleRadius);

	const curves: Curve[] = [];
	const d = (4 / 3) * Math.tan(Math.PI / 2 / numPoints) * radius;
	for (let i = 0; i < numPoints; i++) {
		const pTheta = (Math.PI * 2 * i) / numPoints + Math.PI / 2;
		const qTheta = (Math.PI * 2 * (i + 1)) / numPoints + Math.PI / 2;
		const [px, py] = getPointFromTheta(pTheta, radius);
		const [dpx, dpy] = getPointFromTheta(pTheta + Math.PI / 2, d);
		const [qx, qy] = getPointFromTheta(qTheta, radius);
		const [dqx, dqy] = getPointFromTheta(qTheta - Math.PI / 2, d);
		curves.push([dpx, -dpy, qx + dqx - px, -qy - dqy + py, qx - px, -qy + py]);
	}

	return {
		start: [windowWidth / 2 + wiggleDx, windowHeight / 2 - radius + wiggleDy],
		curves,
	};
}
