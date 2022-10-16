import React from 'react';
import Svg from 'react-native-svg';
import styled from 'styled-components/native';
import WavesAnimation from '../timer/WavesAnimation';

export default function HistoryScreen() {
	return (
		<Container>
			<FlippedSvg>
				<WavesAnimation show move />
			</FlippedSvg>
		</Container>
	);
}

const FlippedSvg = styled(Svg)`
	transform: scaleY(-1);
`;

const Container = styled.View`
	flex: 1;
`;
