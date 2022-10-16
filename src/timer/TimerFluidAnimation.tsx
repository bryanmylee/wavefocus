import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import styled from 'styled-components/native';
import ActiveFocusAnimation from './ActiveFocusAnimation';
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
	const insets = useSafeAreaInsets();
	return (
		<Container>
			<Svg>
				<WavesAnimation
					show={timerStage === 'relax' || !isActive}
					move={timerStage === 'relax'}
					baseHeight={insets.bottom + 110}
				/>
				<ActiveFocusAnimation show={timerStage === 'focus' && isActive} />
			</Svg>
		</Container>
	);
}

const Container = styled.View`
	flex: 1;
`;
