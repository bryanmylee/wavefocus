import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	Easing,
	SharedValue,
	useAnimatedProps,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import {Path} from 'react-native-svg';
import {useTheme} from 'styled-components/native';
import {useOscillatingValue} from '../utils/useOscillatingValue';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WavesAnimationProps {
	show: boolean;
	move: boolean;
	baseHeight: number;
}

export default function WavesAnimation({
	show,
	move,
	baseHeight,
}: WavesAnimationProps) {
	const scale = useSharedValue(1);
	useEffect(
		function animateWaveScale() {
			scale.value = withTiming(move ? 1 : 0, {
				duration: 1000,
				easing: Easing.elastic(1.5),
			});
		},
		[scale, move],
	);
	const waveHeight = useSharedValue(baseHeight);
	useEffect(
		function animateWaveHeight() {
			waveHeight.value = withTiming(show ? baseHeight : 20, {
				duration: 1000,
				easing: Easing.elastic(1.2),
			});
		},
		[show, waveHeight, baseHeight],
	);
	return (
		<>
			<Wave
				waveHeight={waveHeight}
				heightOffset={10}
				cycleMs={5000}
				scale={scale}
			/>
			<Wave waveHeight={waveHeight} cycleMs={3000} scale={scale} />
			<Wave
				waveHeight={waveHeight}
				heightOffset={-10}
				cycleMs={4000}
				scale={scale}
			/>
		</>
	);
}

interface WaveProps {
	waveHeight: SharedValue<number>;
	heightOffset?: number;
	cycleMs: number;
	scale: SharedValue<number>;
}

function Wave({waveHeight, heightOffset, cycleMs, scale}: WaveProps) {
	const theme = useTheme();
	const {width, height} = useWindowDimensions();
	return (
		<AnimatedPath
			fill={theme.timer.fluidFill}
			opacity={theme.timer.fluidOpacity}
			animatedProps={useWavePath({
				windowHeight: height,
				windowWidth: width,
				waveHeight,
				heightOffset,
				cycleMs,
				scale,
			})}
		/>
	);
}

interface WavePathProps {
	windowHeight: number;
	windowWidth: number;
	waveHeight: SharedValue<number>;
	heightOffset?: number;
	cycleMs: number;
	scale: SharedValue<number>;
}

function useWavePath({
	windowHeight,
	windowWidth,
	waveHeight,
	heightOffset,
	cycleMs,
	scale,
}: WavePathProps) {
	const dx = windowWidth / 3;
	const waveLength = windowWidth + dx;
	const numPeaks = Math.ceil(waveLength / IDEAL_WAVE_WIDTH) + 2;

	const progress = useOscillatingValue({
		from: 0,
		to: 1,
		cycleMs,
	});

	const wavePoints = useDerivedValue(() =>
		getWavePoints({
			progress: progress.value,
			numPoints: numPeaks,
			windowWidth,
			windowHeight,
			waveHeight,
			heightOffset,
			scale,
		}),
	);
	return useAnimatedProps(() => ({
		d: getPath(wavePoints.value),
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
	waveHeight: SharedValue<number>;
	heightOffset?: number;
	scale: SharedValue<number>;
}

const IDEAL_WAVE_WIDTH = 200;

export function getWavePoints({
	progress,
	numPoints,
	windowWidth,
	windowHeight,
	waveHeight,
	heightOffset,
	scale,
}: WavePointsProps): FluidPoints {
	'worklet';
	const dx = windowWidth / 3;
	const numPeaks = numPoints - 2;
	const height = waveHeight.value + (heightOffset ?? 0);
	const peakHeight = (height / 4) * scale.value;
	const between = IDEAL_WAVE_WIDTH / 2;
	const curves: Curve[] = [];
	for (let i = 0; i < numPeaks; i++) {
		let y = peakHeight;
		if (i % 2 !== 0) {
			y *= -1;
		}
		curves.push([between, 0, between, y, IDEAL_WAVE_WIDTH, y]);
	}
	curves.push(
		[0, 0, 0, 0, 0, height * 2],
		[0, 0, 0, 0, -numPeaks * IDEAL_WAVE_WIDTH, 0],
	);
	return {
		start: [-dx * progress, windowHeight - height],
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
export function getCirclePoints({
	progress,
	numPoints,
	windowWidth,
	windowHeight,
	radius,
}: CirclePointsProps): FluidPoints {
	'worklet';
	const wiggleRadius = radius * 0.0;
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
