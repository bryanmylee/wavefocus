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

const IDEAL_WAVE_WIDTH = 200;

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
	const waveDx = windowWidth / 3;
	const waveLength = windowWidth + waveDx;
	const numWaves = Math.ceil(waveLength / IDEAL_WAVE_WIDTH);
	const between = waveLength / numWaves / 1.9;
	const wavePeak = waveHeight / 4;
	return useAnimatedProps(() => ({
		d: [
			`M${waveDx * progress.value},${windowHeight - waveHeight}`,
			Array.from({length: numWaves}).map((_, i) => {
				const isDown = i % 2 !== 0;
				let y = wavePeak;
				if (isDown) {
					y *= -1;
				}
				return `c${between},0,${between},${y},${IDEAL_WAVE_WIDTH},${y}`;
			}),
			`v${waveHeight + wavePeak}`,
			`h-${numWaves * IDEAL_WAVE_WIDTH}`,
			`v-${waveHeight}`,
			'z',
		]
			.flat()
			.join(''),
	}));
};
