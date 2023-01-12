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
	OAuthProvider,
	signInAnonymously,
	signInWithPopup,
	User,
} from 'firebase/auth';
import {useFirebase} from '../firebase/FirebaseProvider';
import {
	Subscriber,
	Unsubscriber,
	useCreateSubscriber,
} from '../utils/useCreateSubscriber';
import {useLastActive} from './useLastActive';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

async function signInGoogleAsync(auth: Auth) {
	return await signInWithPopup(auth, googleProvider);
}

async function signInAppleAsync(auth: Auth) {
	return await signInWithPopup(auth, appleProvider);
}

interface SignInAnonEvent {
	user: User;
	prevIsAnon: boolean;
}

export interface UserContext {
	user: User | null;
	isLoading: boolean;
	signInGoogle: () => void;
	signInApple: () => void;
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
	signInGoogle: () => {},
	signInApple: () => {},
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
		await auth.signOut().catch(() => {
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
		await signInGoogleAsync(auth).catch(() => {
			console.warn('signInGoogle: Failed to sign in with Google');
			return signInAnonymous({prevIsAnon: true});
		});
		setIsLoading(false);
	}, [auth, signOutAnonymous, signInAnonymous]);

	const signInApple = useCallback(async () => {
		setIsLoading(true);
		await signOutAnonymous();
		await signInAppleAsync(auth).catch(() => {
			console.warn('signInApple: Failed to sign in with Apple');
			return signInAnonymous({prevIsAnon: true});
		});
		setIsLoading(false);
	}, [auth, signOutAnonymous, signInAnonymous]);

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
