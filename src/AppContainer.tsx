import React, {useCallback} from 'react';
import messaging from '@react-native-firebase/messaging';
import {StatusBar} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import * as VerticalSwipe from './layout/VerticalSwipe';
import TimerScreen from './timer/TimerScreen';
import {useBoolean} from './utils/useBoolean';

async function requestUserPermission() {
	const status = await messaging().requestPermission();
	const enabled =
		status === messaging.AuthorizationStatus.AUTHORIZED ||
		status === messaging.AuthorizationStatus.PROVISIONAL;
	return enabled;
}

export default function AppContainer() {
	const theme = useTheme();
	const showLogin = useBoolean(false);

	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);

	const handlePlay = useCallback(() => {
		requestUserPermission();
	}, []);

	return (
		<Container style={containerAnim}>
			<StatusBar backgroundColor={theme.background} barStyle="dark-content" />
			<VerticalSwipe.Navigator
				showAlt={showLogin.value}
				onUpdateShowAlt={showLogin.setValue}>
				<VerticalSwipe.Screen forceMount>
					<TimerScreen onPlay={handlePlay} />
				</VerticalSwipe.Screen>
				<VerticalSwipe.Screen isAlt>
					<LoginScreen onDismiss={showLogin.setFalse} />
				</VerticalSwipe.Screen>
			</VerticalSwipe.Navigator>
		</Container>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
