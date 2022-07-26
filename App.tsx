import React from 'react';
import {StatusBar} from 'react-native';
import styled from 'styled-components/native';
import UserProvider from './src/auth/UserProvider';
import TimerScreen from './src/timer/TimerScreen';

export default function App() {
	return (
		<UserProvider>
			<Container>
				<StatusBar backgroundColor="#e2fffa" barStyle="dark-content" />
				<TimerScreen />
			</Container>
		</UserProvider>
	);
}

const Container = styled.View`
	background-color: #e2fffa;
	flex: 1;
`;
