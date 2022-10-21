import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import styled from 'styled-components/native';
import ActiveFocusAnimation from './ActiveFocusAnimation';
import WavesAnimation from './WavesAnimation';

interface TimerFluidAnimationProps {
	isActive: boolean;
	isFocus: boolean;
	pause?: boolean;
}

export function TimerFluidAnimation({
	isActive,
	isFocus,
	pause,
}: TimerFluidAnimationProps) {
	const insets = useSafeAreaInsets();
	return (
		<Container>
			<Svg>
				<WavesAnimation
					show={!isFocus || !isActive}
					move={!isFocus}
					pause={pause}
					baseHeight={insets.bottom + 110}
				/>
				<ActiveFocusAnimation show={isFocus && isActive} pause={pause} />
			</Svg>
		</Container>
	);
}

const Container = styled.View`
	flex: 1;
`;
