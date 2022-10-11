import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	cancelAnimation,
	useAnimatedProps,
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
	const progress = useOscillatingValue({
		from: 0,
		to: -1,
		cycleMs,
	});
	return useAnimatedProps(() => ({
		d: wavePath({
			progress: progress.value,
			windowWidth,
			windowHeight,
			waveHeight,
		}),
	}));
};

interface WavePathProps {
	progress: number;
	windowWidth: number;
	windowHeight: number;
	waveHeight: number;
}

const IDEAL_WAVE_WIDTH = 200;

const wavePath = ({
	progress,
	windowWidth,
	windowHeight,
	waveHeight,
}: WavePathProps) => {
	'worklet';
	const dx = windowWidth / 3;
	const waveLength = windowWidth + dx;
	const numPeaks = Math.ceil(waveLength / IDEAL_WAVE_WIDTH);
	const between = waveLength / numPeaks / 1.9;
	const peakHeight = waveHeight / 4;
	return [
		`M${dx * progress},${windowHeight - waveHeight}`,
		Array.from({length: numPeaks}).map((_, i) => {
			const isDown = i % 2 !== 0;
			let y = peakHeight;
			if (isDown) {
				y *= -1;
			}
			return `c${between},0,${between},${y},${IDEAL_WAVE_WIDTH},${y}`;
		}),
		`v${waveHeight + peakHeight}`,
		`h-${numPeaks * IDEAL_WAVE_WIDTH}`,
		`v-${waveHeight}`,
		'z',
	]
		.flat()
		.join('');
};
