import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import {useThemeBodyClassList} from './theme/useThemeBodyClassList';
import {useNotifyBackground} from './utils/useNotifyBackground';

export default function App() {
	useNotifyBackground();
	useRegisterDeviceToken();
	useThemeBodyClassList();
	return (
		<div className="w-80 h-96 bg-background">
			<h1 className="text-text-base">Wave Focus</h1>
		</div>
	);
}
