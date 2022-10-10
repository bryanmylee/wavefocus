import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
	webClientId:
		'843057937567-v8tqhtkak5qmvnjf5j873dkn2svugn19.apps.googleusercontent.com',
});

async function signInGoogleAsync() {
	const {idToken} = await GoogleSignin.signIn();
	const googleCredential = auth.GoogleAuthProvider.credential(idToken);
	return auth().signInWithCredential(googleCredential);
}

export interface UserContext {
	user: FirebaseAuthTypes.User | null;
	isLoading: boolean;
	signInGoogle: () => void;
	signOut: () => void;
}

const UserContext = createContext<UserContext>({
	user: auth().currentUser,
	isLoading: false,
	signInGoogle: () => {},
	signOut: () => {},
});
export const useUser = () => useContext(UserContext);

export default function UserProvider({children}: PropsWithChildren) {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
		auth().currentUser,
	);

	useEffect(
		function syncAuthState() {
			return auth().onAuthStateChanged(
				(newUser: FirebaseAuthTypes.User | null) => {
					setUser(newUser);
					setIsLoading(user == null);
				},
			);
		},
		[user],
	);

	useEffect(function anonymousIfNoUserOnLoad() {
		if (user == null) {
			setIsLoading(true);
			auth()
				.signInAnonymously()
				.catch(() => {
					console.warn(
						'anonymousIfNoUserOnLoad: Failed to sign in anonymously',
					);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const signOut = useCallback(async () => {
		setIsLoading(true);
		await auth()
			.signOut()
			.catch(() => {
				console.warn('signOut: Failed to sign out');
			});
		await auth()
			.signInAnonymously()
			.catch(() => {
				console.warn('signOut: Failed to sign in anonymously');
			});
		setIsLoading(false);
	}, []);

	const signOutAnonymous = useCallback(async () => {
		if (user == null || !user.isAnonymous) {
			return;
		}
		await user.delete().catch(() => {
			console.warn('signOutAnonymous: Failed to delete anonymous user');
		});
	}, [user]);

	const signInGoogle = useCallback(async () => {
		setIsLoading(true);
		await signOutAnonymous();
		await signInGoogleAsync().catch(() => {
			console.warn('signInGoogle: Failed to sign in with Google');
			return auth().signInAnonymously();
		});
		setIsLoading(false);
	}, [signOutAnonymous]);

	return (
		<UserContext.Provider
			value={{
				user,
				isLoading,
				signInGoogle,
				signOut,
			}}>
			{children}
		</UserContext.Provider>
	);
}
