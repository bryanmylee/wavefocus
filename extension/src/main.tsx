import React from 'react';
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import ReactDOM from 'react-dom/client';
import AppContainer from './AppContainer';

const firebaseConfig = {
	apiKey: 'AIzaSyC_7X59yKSjxd-RoPOmBwSg-QbbMiTJDtQ',
	authDomain: 'wave-focus.firebaseapp.com',
	projectId: 'wave-focus',
	storageBucket: 'wave-focus.appspot.com',
	messagingSenderId: '843057937567',
	appId: '1:843057937567:web:2f22151d63d95f1ee276aa',
	measurementId: 'G-661EN2RHBE',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<AppContainer />
	</React.StrictMode>,
);
