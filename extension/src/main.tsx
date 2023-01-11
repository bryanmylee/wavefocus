import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './AppContainer';
import FirebaseProvider from './FirebaseProvider';
import UserProvider from './auth/UserProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<FirebaseProvider>
			<UserProvider>
				<AppContainer />
			</UserProvider>
		</FirebaseProvider>
	</React.StrictMode>,
);
