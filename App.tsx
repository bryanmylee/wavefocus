import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import AppContainer from './src/AppContainer';
import UserProvider from './src/auth/UserProvider';
import ThemeProvider from './src/theme/ThemeProvider';
import TimerStageProvider from './src/timer/TimerStageProvider';

export default function App() {
	return (
		<FlexGestureHandlerRootView>
			<UserProvider>
				<TimerStageProvider>
					<ThemeProvider>
						<AppContainer />
					</ThemeProvider>
				</TimerStageProvider>
			</UserProvider>
		</FlexGestureHandlerRootView>
	);
}

const FlexGestureHandlerRootView = styled(GestureHandlerRootView)`
	flex: 1;
`;
