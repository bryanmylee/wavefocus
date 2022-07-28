import React from 'react';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useTheme} from 'styled-components';
import styled from 'styled-components/native';

export interface TimerProps {
	seconds: number;
}

export default function Timer({seconds}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');
	const theme = useTheme();
	const textAnim = useAnimatedStyle(
		() => ({
			color: withTiming(theme.timer.text),
		}),
		[theme.timer.text],
	);
	return (
		<TimerText style={textAnim}>
			{minutePart}:{secondPart}
		</TimerText>
	);
}

const TimerText = styled(Animated.Text)`
	font-family: Inter;
	font-size: 56px;
	font-weight: 700;
`;
