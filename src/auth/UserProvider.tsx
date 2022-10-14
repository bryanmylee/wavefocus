import React, {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	appleAuth,
	appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Platform} from 'react-native';
import {
	Subscriber,
	Unsubscriber,
	useCreateSubscriber,
} from '../utils/useCreateSubscriber';

GoogleSignin.configure({
	webClientId:
		'843057937567-v8tqhtkak5qmvnjf5j873dkn2svugn19.apps.googleusercontent.com',
});

async function signInGoogleAsync() {
	const {idToken} = await GoogleSignin.signIn();
	const googleCredential = auth.GoogleAuthProvider.credential(idToken);
	return auth().signInWithCredential(googleCredential);
}

async function getAppleAuthResponseAndroid() {
	appleAuthAndroid.configure({
		clientId: 'com.bryanmylee.wavefocus.sign-in-with-apple',
		redirectUri: 'https://wave-focus.firebaseapp.com/__/auth/handler',
		responseType: appleAuthAndroid.ResponseType.ALL,
		scope: appleAuthAndroid.Scope.ALL,
	});

	const response = await appleAuthAndroid.signIn();
	const {id_token, nonce} = response;
	if (id_token == null) {
		throw new Error(
			'getAppleResponseAndroid: Failed to retrieve Apple identity token',
		);
	}
	return [id_token, nonce] as const;
}

async function getAppleAuthResponse() {
	const response = await appleAuth.performRequest({
		requestedOperation: appleAuth.Operation.LOGIN,
		// FULL_NAME must come before EMAIL.
		requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
	});

	const {identityToken, nonce} = response;

	if (identityToken == null) {
		throw new Error(
			'signInAppleAsync: Failed sign in due to missing identity token',
		);
	}

	return [identityToken, nonce] as const;
}

async function signInAppleAsync() {
	const [identityToken, nonce] =
		Platform.OS === 'android'
			? await getAppleAuthResponseAndroid()
			: await getAppleAuthResponse();

	// Create a Firebase credential from the response
	const appleCredential = auth.AppleAuthProvider.credential(
		identityToken,
		nonce,
	);

	return auth().signInWithCredential(appleCredential);
}

interface SignInAnonEvent {
	user: FirebaseAuthTypes.User;
	prevIsAnon: boolean;
}

export interface UserContext {
	user: FirebaseAuthTypes.User | null;
	isLoading: boolean;
	signInGoogle: () => void;
	signInApple: () => void;
	signOut: () => void;
	subscribeBeforeSignOutAnonymously: (
		subscriber: Subscriber<FirebaseAuthTypes.User>,
	) => Unsubscriber;
	subscribeAfterSignInAnonymously: (
		subscriber: Subscriber<SignInAnonEvent>,
	) => Unsubscriber;
}

const UserContext = createContext<UserContext>({
	user: auth().currentUser,
	isLoading: false,
	signInGoogle: () => {},
	signInApple: () => {},
	signOut: () => {},
	subscribeBeforeSignOutAnonymously: () => () => {},
	subscribeAfterSignInAnonymously: () => () => {},
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

	const [notifyBeforeSignOutAnon, subscribeBeforeSignOutAnonymously] =
		useCreateSubscriber<FirebaseAuthTypes.User>();
	const signOutAnonymous = useCallback(async () => {
		if (user == null || !user.isAnonymous) {
			return;
		}
		notifyBeforeSignOutAnon(user);
		await user.delete().catch(() => {
			console.warn('signOutAnonymous: Failed to delete anonymous user');
		});
	}, [user, notifyBeforeSignOutAnon]);

	const [notifyAfterSignInAnon, subscribeAfterSignInAnonymously] =
		useCreateSubscriber<SignInAnonEvent>();
	const signInAnonymous = useCallback(
		async ({prevIsAnon}: Pick<SignInAnonEvent, 'prevIsAnon'>) => {
			const newAnonUser = await auth().signInAnonymously();
			notifyAfterSignInAnon({user: newAnonUser.user, prevIsAnon});
			return newAnonUser;
		},
		[notifyAfterSignInAnon],
	);

	useEffect(function anonymousIfNoUserOnLoad() {
		if (user == null) {
			setIsLoading(true);
			signInAnonymous({
				prevIsAnon: true,
			})
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
		await signInAnonymous({prevIsAnon: false}).catch(() => {
			console.warn('signOut: Failed to sign in anonymously');
		});
		setIsLoading(false);
	}, [signInAnonymous]);

	const signInGoogle = useCallback(async () => {
		setIsLoading(true);
		await signOutAnonymous();
		await signInGoogleAsync().catch(() => {
			console.warn('signInGoogle: Failed to sign in with Google');
			return signInAnonymous({prevIsAnon: true});
		});
		setIsLoading(false);
	}, [signOutAnonymous, signInAnonymous]);

	const signInApple = useCallback(async () => {
		setIsLoading(true);
		await signOutAnonymous();
		await signInAppleAsync().catch(() => {
			console.warn('signInApple: Failed to sign in with Apple');
			return signInAnonymous({prevIsAnon: true});
		});
		setIsLoading(false);
	}, [signOutAnonymous, signInAnonymous]);

	return (
		<UserContext.Provider
			value={{
				user,
				isLoading,
				signInGoogle,
				signInApple,
				signOut,
				subscribeBeforeSignOutAnonymously,
				subscribeAfterSignInAnonymously,
			}}>
			{children}
		</UserContext.Provider>
	);
}
