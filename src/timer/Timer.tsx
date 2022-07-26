import React from 'react';
import styled from 'styled-components/native';

export interface TimerProps {
	seconds: number;
}

export default function Timer({seconds}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');
	return (
		<TimerText>
			{minutePart}:{secondPart}
		</TimerText>
	);
}

const TimerText = styled.Text`
	color: #004f40;
	font-size: 56px;
	font-weight: 700;
`;
