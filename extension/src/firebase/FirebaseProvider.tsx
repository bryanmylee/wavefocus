import {createContext, PropsWithChildren, useContext} from 'react';
import {initializeApp} from 'firebase/app';
import {browserLocalPersistence, getAuth, setPersistence} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {firebaseConfig} from './config';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
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
