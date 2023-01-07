import React, {useCallback, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {StatusBar, useColorScheme} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import {Toast, ToastContainer} from './components/Toast';
import * as VerticalSwipe from './components/VerticalSwipe';
import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import HistoryScreen from './history/HistoryScreen';
import TimerScreen from './timer/TimerScreen';
import {useShowPrompt} from './utils/useShowPrompt';
import {SimultaneousGesturesProvider} from './utils/useSimultaneousGestures';

async function requestUserPermission() {
	const status = await messaging().requestPermission();
	const enabled =
		status === messaging.AuthorizationStatus.AUTHORIZED ||
		status === messaging.AuthorizationStatus.PROVISIONAL;
	return enabled;
}

const LOGIN_PROMPT_KEY = 'viewed_login';
const HISTORY_PROMPT_KEY = 'viewed_history';

export default function AppContainer() {
	useRegisterDeviceToken();

	const theme = useTheme();

	const [screen, setScreen] = useState<VerticalSwipe.ScreenType>('main');
	const hideLogin = useCallback(() => {
		setScreen('main');
	}, []);

	const [showLoginPrompt, requestLoginPrompt, dismissLoginPrompt] =
		useShowPrompt(LOGIN_PROMPT_KEY);
	const [showHistoryPrompt, requestHistoryPrompt, dissmissHistoryPrompt] =
		useShowPrompt(HISTORY_PROMPT_KEY);

	const handleChangeScreen = useCallback(
		(screenToShow: VerticalSwipe.ScreenType) => {
			setScreen(screenToShow);
			if (screenToShow === 'top') {
				dismissLoginPrompt();
			}
			if (screenToShow === 'bottom') {
				dissmissHistoryPrompt();
			}
		},
		[dismissLoginPrompt, dissmissHistoryPrompt],
	);

	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);

	const handlePlay = useCallback(() => {
		requestLoginPrompt();
		requestHistoryPrompt();
		requestUserPermission();
	}, [requestLoginPrompt, requestHistoryPrompt]);

	const colorScheme = useColorScheme();

	return (
		<SimultaneousGesturesProvider>
			<Container style={containerAnim}>
				<StatusBar
					backgroundColor={theme.background}
					barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				/>
				<VerticalSwipe.Navigator
					screen={screen}
					onChangeScreen={handleChangeScreen}>
					<VerticalSwipe.Screen forceMount type="bottom">
						<HistoryScreen />
					</VerticalSwipe.Screen>
					<VerticalSwipe.Screen type="top">
						<LoginScreen onDismiss={hideLogin} />
					</VerticalSwipe.Screen>
					<VerticalSwipe.Screen forceMount type="main">
						<TimerScreen onPlay={handlePlay} />
					</VerticalSwipe.Screen>
				</VerticalSwipe.Navigator>
				<ToastContainer top={16} bottom={144}>
					<Toast
						message="Swipe down to sync timers across devices"
						show={screen === 'main' && showLoginPrompt}
						icon="arrow-down"
					/>
					<Toast
						position="bottom"
						message="Swipe up to view history"
						show={screen === 'main' && showHistoryPrompt}
						icon="arrow-up"
					/>
				</ToastContainer>
			</Container>
		</SimultaneousGesturesProvider>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
