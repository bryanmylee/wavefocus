import React from 'react';
import {StatusBar} from 'react-native';
import styled from 'styled-components/native';
import TimerScreen from './src/timer/TimerScreen';

export default function App() {
	return (
		<Container>
			<StatusBar backgroundColor="#00000000" barStyle="dark-content" />
			<TimerScreen />
		</Container>
	);
}

const Container = styled.View`
	background-color: #e2fffa;
	flex: 1;
`;
