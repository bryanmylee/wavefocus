import React from 'react';
import {StatusBar} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import VerticalSwipe from './layout/VerticalSwipe';
import TimerScreen from './timer/TimerScreen';
import {useBoolean} from './utils/useBoolean';

export default function AppContainer() {
	const theme = useTheme();
	const showLogin = useBoolean(false);

	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);

	return (
		<Container style={containerAnim}>
			<StatusBar backgroundColor={theme.background} barStyle="dark-content" />
			<VerticalSwipe.Navigator
				showAlt={showLogin.value}
				onUpdateShowAlt={showLogin.setValue}>
				<VerticalSwipe.Screen>
					<TimerScreen onPressLoginButton={showLogin.toggle} />
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
