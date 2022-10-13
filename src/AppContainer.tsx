import React, {useCallback, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {StatusBar} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import Toast from './components/Toast';
import {useRegisterDeviceToken} from './device/useRegisterDeviceToken';
import * as VerticalSwipe from './layout/VerticalSwipe';
import {SimultaneousGesturesProvider} from './layout/useSimultaneousGestures';
import TimerScreen from './timer/TimerScreen';
import {useShowLoginPrompt} from './utils/useShowLoginPrompt';

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

	const handleChangeShowAlt = useCallback(
		(showAlt: boolean) => {
			setShowLogin(showAlt);
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

	return (
		<SimultaneousGesturesProvider>
			<Container style={containerAnim}>
				<Toast
					message="Swipe down to sync timers across devices"
					show={showPrompt}
				/>
				<StatusBar backgroundColor={theme.background} barStyle="dark-content" />
				<VerticalSwipe.Navigator
					showAlt={showLogin}
					onChangeShowAlt={handleChangeShowAlt}>
					<VerticalSwipe.Screen forceMount>
						<TimerScreen onPlay={handlePlay} />
					</VerticalSwipe.Screen>
					<VerticalSwipe.Screen isAlt>
						<LoginScreen onDismiss={hideLogin} />
					</VerticalSwipe.Screen>
				</VerticalSwipe.Navigator>
			</Container>
		</SimultaneousGesturesProvider>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
