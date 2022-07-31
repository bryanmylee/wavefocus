import React, {useCallback, useState} from 'react';
import {StatusBar} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import LoginScreen from './auth/LoginScreen';
import VerticalSwipe from './layout/VerticalSwipe';
import TimerScreen from './timer/TimerScreen';

export default function AppContainer() {
	const theme = useTheme();
	const [showLoginScreen, setShowLoginScreen] = useState(false);
	const handlePressLoginButton = useCallback(() => {
		setShowLoginScreen((s) => !s);
	}, []);
	const handleDismissLoginScreen = useCallback(() => {
		setShowLoginScreen(false);
	}, []);

	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);

	return (
		<Container style={containerAnim}>
			<StatusBar backgroundColor={theme.background} barStyle="dark-content" />
			<VerticalSwipe.Navigator showAlt={showLoginScreen}>
				<VerticalSwipe.Screen>
					<TimerScreen onPressLoginButton={handlePressLoginButton} />
				</VerticalSwipe.Screen>
				<VerticalSwipe.Screen isAlt>
					<LoginScreen onDismiss={handleDismissLoginScreen} />
				</VerticalSwipe.Screen>
			</VerticalSwipe.Navigator>
		</Container>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
