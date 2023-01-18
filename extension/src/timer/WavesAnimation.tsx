import clsx from 'classnames';
import classes from './WavesAnimation.module.css';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

interface WavesAnimationProps {
	show: boolean;
	move: boolean;
	baseHeight: number;
	pause?: boolean;
}

export default function WavesAnimation({
	show,
	move,
	baseHeight,
	pause,
}: WavesAnimationProps) {
	const scale = move ? 1 : 0;
	const waveHeight = show ? baseHeight : 20;
	return (
		<>
			<Wave
				waveHeight={waveHeight}
				heightOffset={10}
				cycleMs={5000}
				scale={scale}
				pause={pause}
			/>
			<Wave
				waveHeight={waveHeight}
				cycleMs={3000}
				scale={scale}
				pause={pause}
			/>
			<Wave
				waveHeight={waveHeight}
				heightOffset={-10}
				cycleMs={4000}
				scale={scale}
				pause={pause}
			/>
		</>
	);
}

interface WaveProps {
	waveHeight: number;
	heightOffset?: number;
	cycleMs: number;
	scale: number;
	pause?: boolean;
}

function Wave({waveHeight, heightOffset, cycleMs, scale, pause}: WaveProps) {
	const {width, height} = useTimerScreenDimensions();
	return (
		<path
			fill="hsl(var(--color-timer-fluid-fill) / var(--opacity-timer-fluid))"
			d={useWavePath({
				windowHeight: height,
				windowWidth: width,
				waveHeight,
				heightOffset,
			})}
			className={clsx(
				classes.waves__wave,
				'transition-opacity duration-500',
				scale === 0 && 'opacity-0',
			)}
			style={
				{
					'--cycleMs': `${pause ? 0 : cycleMs}ms`,
				} as any
			}
		/>
	);
}

interface WavePathProps {
	windowHeight: number;
	windowWidth: number;
	waveHeight: number;
	heightOffset?: number;
}

function useWavePath({
	windowHeight,
	windowWidth,
	waveHeight,
	heightOffset,
}: WavePathProps) {
	const dx = windowWidth / 2;
	const waveLength = windowWidth + dx;
	const numPeaks = Math.ceil(waveLength / IDEAL_WAVE_WIDTH) + 4;

	const wavePoints = getWavePoints({
		numPoints: numPeaks,
		windowWidth,
		windowHeight,
		waveHeight,
		heightOffset,
	});
	return getPath(wavePoints);
}

type Point = [number, number];
type Curve = [number, number, number, number, number, number];

interface FluidPoints {
	start: Point;
	curves: Curve[];
}

function getPath({start, curves}: FluidPoints): string {
	return (
		'M' +
		start.join(',') +
		curves.map((curve) => 'c' + curve.join(',')).join('')
	);
}

interface WavePointsProps {
	numPoints: number;
	windowWidth: number;
	windowHeight: number;
	waveHeight: number;
	heightOffset?: number;
}

const IDEAL_WAVE_WIDTH = 200;

export function getWavePoints({
	numPoints,
	windowWidth,
	windowHeight,
	waveHeight,
	heightOffset,
}: WavePointsProps): FluidPoints {
	const dx = windowWidth / 3;
	const numPeaks = numPoints - 2;
	const height = waveHeight + (heightOffset ?? 0);
	const peakHeight = height / 4;
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
		start: [-dx, windowHeight - height],
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
