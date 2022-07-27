import React from 'react';
import AppContainer from './src/AppContainer';
import UserProvider from './src/auth/UserProvider';
import ThemeProvider from './src/theme/ThemeProvider';
import TimerStageProvider from './src/timer/TimerStageProvider';

export default function App() {
	return (
		<UserProvider>
			<TimerStageProvider>
				<ThemeProvider>
					<AppContainer />
				</ThemeProvider>
			</TimerStageProvider>
		</UserProvider>
	);
}
