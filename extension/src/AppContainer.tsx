import {useState} from 'react';
import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import {useThemeBodyClassList} from './theme/useThemeBodyClassList';
import TimerScreen from './timer/TimerScreen';
import {useNotifyBackground} from './utils/useNotifyBackground';

export default function App() {
	useNotifyBackground();
	useRegisterDeviceToken();
	useThemeBodyClassList();
	const [showLogin, setShowLogin] = useState(false);
	return (
		<div className="bg-background transition-colors">
			{showLogin ? null : <TimerScreen />}
		</div>
	);
}
