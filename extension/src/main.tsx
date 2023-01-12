import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './AppContainer';
import UserProvider from './auth/UserProvider';
import FirebaseProvider from './firebase/FirebaseProvider';
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
