import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import styled from 'styled-components/native';
import WavesAnimation from '../timer/WavesAnimation';

interface HistoryHeaderAnimationProps {
	pause?: boolean;
}

export default function HistoryHeaderAnimation({
	pause,
}: HistoryHeaderAnimationProps) {
	const insets = useSafeAreaInsets();
	return (
		<FlippedSvg>
			<WavesAnimation show move pause={pause} baseHeight={insets.top + 30} />
		</FlippedSvg>
	);
}

const FlippedSvg = styled(Svg)`
	transform: scaleY(-1);
`;
