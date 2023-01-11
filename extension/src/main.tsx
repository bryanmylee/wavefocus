import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './AppContainer';
import FirebaseProvider from './FirebaseProvider';
import UserProvider from './auth/UserProvider';
import TimerStageProvider from './timer/TimerStageProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<FirebaseProvider>
			<UserProvider>
				<TimerStageProvider>
					<AppContainer />
				</TimerStageProvider>
			</UserProvider>
		</FirebaseProvider>
	</React.StrictMode>,
);
