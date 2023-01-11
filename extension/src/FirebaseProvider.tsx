import {createContext, PropsWithChildren, useContext} from 'react';
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

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
const firestore = getFirestore(app);

const FirebaseContext = createContext({
	app,
	auth,
	firestore,
});
export const useFirebase = () => useContext(FirebaseContext);

export default function FirebaseProvider({children}: PropsWithChildren) {
	return (
		<FirebaseContext.Provider value={{app, auth, firestore}}>
			{children}
		</FirebaseContext.Provider>
	);
}
