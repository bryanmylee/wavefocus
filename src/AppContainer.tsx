import React from 'react';
import {StatusBar} from 'react-native';
import {useTheme} from 'styled-components';
import styled from 'styled-components/native';
import TimerScreen from './timer/TimerScreen';

export default function AppContainer() {
	const {background} = useTheme();
	return (
		<Container>
			<StatusBar backgroundColor={background} barStyle="dark-content" />
			<TimerScreen />
		</Container>
	);
}

const Container = styled.View`
	background-color: ${(p) => p.theme.background};
	flex: 1;
`;
