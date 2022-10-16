import React, {useCallback, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {StatusBar, useColorScheme} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import {Toast, ToastContainer} from './components/Toast';
import * as VerticalSwipe from './components/VerticalSwipe';
import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import TimerScreen from './timer/TimerScreen';
import {useShowLoginPrompt} from './utils/useShowLoginPrompt';
import {SimultaneousGesturesProvider} from './utils/useSimultaneousGestures';

async function requestUserPermission() {
	const status = await messaging().requestPermission();
	const enabled =
		status === messaging.AuthorizationStatus.AUTHORIZED ||
		status === messaging.AuthorizationStatus.PROVISIONAL;
	return enabled;
}

export default function AppContainer() {
	useRegisterDeviceToken();

	const theme = useTheme();

	const [showLogin, setShowLogin] = useState(false);
	const hideLogin = useCallback(() => {
		setShowLogin(false);
	}, []);

	const [showPrompt, requestPrompt, acknowledgePrompt] = useShowLoginPrompt();

	const handleChangeShowTop = useCallback(
		(screenToShow: VerticalSwipe.ScreenType) => {
			setShowLogin(screenToShow === 'top');
			acknowledgePrompt();
		},
		[acknowledgePrompt],
	);

	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);

	const handlePlay = useCallback(() => {
		requestPrompt();
		requestUserPermission();
	}, [requestPrompt]);

	const colorScheme = useColorScheme();

	return (
		<SimultaneousGesturesProvider>
			<Container style={containerAnim}>
				<StatusBar
					backgroundColor={theme.background}
					barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				/>
				<VerticalSwipe.Navigator
					screen={showLogin ? 'top' : 'main'}
					onChangeScreen={handleChangeShowTop}>
					<VerticalSwipe.Screen forceMount type="main">
						<TimerScreen onPlay={handlePlay} />
					</VerticalSwipe.Screen>
					<VerticalSwipe.Screen type="top">
						<LoginScreen onDismiss={hideLogin} />
					</VerticalSwipe.Screen>
					<VerticalSwipe.Screen type="bottom">
						<LoginScreen onDismiss={hideLogin} />
					</VerticalSwipe.Screen>
				</VerticalSwipe.Navigator>
				<ToastContainer>
					<Toast
						message="Swipe down to sync timers across devices"
						show={showPrompt}
						icon="arrow-down"
					/>
				</ToastContainer>
			</Container>
		</SimultaneousGesturesProvider>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
