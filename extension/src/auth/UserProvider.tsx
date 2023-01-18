import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	Auth,
	GoogleAuthProvider,
	signInAnonymously,
	signInWithCredential,
	User,
} from 'firebase/auth';
import {useFirebase} from '../firebase/FirebaseProvider';
import {
	Subscriber,
	Unsubscriber,
	useCreateSubscriber,
} from '../utils/useCreateSubscriber';
import {useLastActive} from './useLastActive';

async function signInAsync(auth: Auth) {
	if (typeof chrome !== 'undefined') {
		return await chrome_signIn(auth);
	}
	console.warn('Google sign in not supported in this browser');
}

async function chrome_signIn(auth: Auth) {
	const accessToken = await new Promise<string>((resolve) => {
		chrome.identity.getAuthToken({interactive: true}, resolve);
	});
	if (accessToken == null) {
		throw new Error('chrome_signIn: Unable to get user access token');
	}
	const credential = GoogleAuthProvider.credential(null, accessToken);
	try {
		return await signInWithCredential(auth, credential);
	} catch (err) {
		throw new Error('chrome_signIn: Failed to sign in with user credential');
	}
}

interface SignInAnonEvent {
	user: User;
	prevIsAnon: boolean;
}

export interface UserContext {
	user: User | null;
	isLoading: boolean;
	signIn: () => void;
	signOut: () => void;
	subscribeBeforeSignOutAnonymously: (
		subscriber: Subscriber<User>,
	) => Unsubscriber;
	subscribeAfterSignInAnonymously: (
		subscriber: Subscriber<SignInAnonEvent>,
	) => Unsubscriber;
}

const UserContext = createContext<UserContext>({
	user: null,
	isLoading: false,
	signIn: () => {},
	signOut: () => {},
	subscribeBeforeSignOutAnonymously: () => () => {},
	subscribeAfterSignInAnonymously: () => () => {},
});
export const useUser = () => useContext(UserContext);

export default function UserProvider({children}: PropsWithChildren) {
	const {auth} = useFirebase();

	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(() => auth.currentUser);

	useLastActive(user);

	useEffect(
		function syncAuthState() {
			return auth.onAuthStateChanged((newUser: User | null) => {
				setUser(newUser);
				setIsLoading(user == null);
			});
		},
		[user],
	);

	const [notifyBeforeSignOutAnon, subscribeBeforeSignOutAnonymously] =
		useCreateSubscriber<User>();
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
			const newAnonUser = await signInAnonymously(auth);
			notifyAfterSignInAnon({user: newAnonUser.user, prevIsAnon});
			return newAnonUser;
		},
		[notifyAfterSignInAnon],
	);

	useEffect(
		function anonymousIfNoUserOnLoad() {
			// Wait a few seconds for any persisted user to load.
			const timeout = setTimeout(() => {
				if (user != null) return;
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
			}, 2000);
			return () => {
				clearTimeout(timeout);
			};
		},
		[user],
	);

	const signOut = useCallback(async () => {
		setIsLoading(true);
		await auth.signOut().catch(() => {
			console.warn('signOut: Failed to sign out');
		});
		await signInAnonymous({prevIsAnon: false}).catch(() => {
			console.warn('signOut: Failed to sign in anonymously');
		});
		setIsLoading(false);
	}, [signInAnonymous]);

	const signIn = useCallback(async () => {
		setIsLoading(true);
		await signOutAnonymous();
		await signInAsync(auth).catch(() => {
			console.warn('signInGoogle: Failed to sign in with Google');
			return signInAnonymous({prevIsAnon: true});
		});
		setIsLoading(false);
	}, [auth, signOutAnonymous, signInAnonymous]);

	return (
		<UserContext.Provider
			value={{
				user,
				isLoading: isLoading || user == null,
				signIn,
				signOut,
				subscribeBeforeSignOutAnonymously,
				subscribeAfterSignInAnonymously,
			}}>
			{children}
		</UserContext.Provider>
	);
}
