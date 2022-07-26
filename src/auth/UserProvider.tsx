import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

export interface TUserContext {
	user: FirebaseAuthTypes.User | null;
	isReady: boolean;
}

const UserContext = createContext<TUserContext>({
	user: auth().currentUser,
	isReady: false,
});
export const useUser = () => useContext(UserContext);

export default function UserProvider({children}: PropsWithChildren) {
	const [isReady, setIsReady] = useState(false);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		auth().currentUser,
	);

	useEffect(function synchronizeAuthState() {
		return auth().onAuthStateChanged(
			(newUser: FirebaseAuthTypes.User | null) => {
				setUser(newUser);
				setIsReady(true);
			},
		);
	}, []);

	useEffect(function anonymousIfNoUserOnLoad() {
		if (user === null) {
			auth().signInAnonymously();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<UserContext.Provider
			value={{
				user,
				isReady,
			}}>
			{children}
		</UserContext.Provider>
	);
}
