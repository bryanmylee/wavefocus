import React, {useEffect} from 'react';
import {useWindowDimensions} from 'react-native';
import Animated, {
	useAnimatedProps,
	useSharedValue,
	withRepeat,
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
						cycleMs: 5000,
					})}
				/>
				<AnimatedPath
					fill={theme.timer.fluidFill}
					opacity={theme.timer.fluidOpacity}
					animatedProps={useFluidPath({
						windowHeight: height,
						windowWidth: width,
						waveHeight: height / 5.5,
						cycleMs: 3000,
					})}
				/>
				<AnimatedPath
					fill={theme.timer.fluidFill}
					opacity={theme.timer.fluidOpacity}
					animatedProps={useFluidPath({
						windowHeight: height,
						windowWidth: width,
						waveHeight: height / 5.75,
						cycleMs: 4000,
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

interface WavePathProps {
	windowHeight: number;
	windowWidth: number;
	waveHeight: number;
	cycleMs: number;
}

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
		progress.value = withRepeat(withTiming(to, {duration: cycleMs}), -1, true);
	}, [from, to, cycleMs, progress]);
	return progress;
}

const useFluidPath = ({
	windowHeight,
	windowWidth,
	waveHeight,
	cycleMs,
}: WavePathProps) => {
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
