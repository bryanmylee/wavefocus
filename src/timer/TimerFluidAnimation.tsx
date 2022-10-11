import React from 'react';
import Svg from 'react-native-svg';
import styled from 'styled-components/native';
import WavesAnimation from './WavesAnimation';
import {TimerStage} from './types';

interface TimerFluidAnimationProps {
	isActive: boolean;
	timerStage: TimerStage;
}

export function TimerFluidAnimation({
	isActive,
	timerStage,
}: TimerFluidAnimationProps) {
	return (
		<Container>
			<Svg>
				<WavesAnimation move={timerStage === 'relax'} />
			</Svg>
		</Container>
	);
}

const Container = styled.View`
	flex: 1;
`;
