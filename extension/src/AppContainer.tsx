import {useCallback, useState} from 'react';
import SignInScreen from './auth/SignInScreen';
import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import {useThemeBodyClassList} from './theme/useThemeBodyClassList';
import TimerScreen from './timer/TimerScreen';
import {useNotifyBackground} from './utils/useNotifyBackground';

export default function App() {
	useNotifyBackground();
	useRegisterDeviceToken();
	useThemeBodyClassList();

	const [showSignIn, setShowSignIn] = useState(false);
	const toggleShowSignIn = useCallback(() => {
		setShowSignIn((s) => !s);
	}, []);

	return (
		<div className="bg-background transition-colors">
			<SignInScreen show={showSignIn} />
			<TimerScreen onShowSignInPage={toggleShowSignIn} />
		</div>
	);
}
