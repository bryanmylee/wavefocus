import React from 'react';
import {StatusBar} from 'react-native';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import TimerScreen from './timer/TimerScreen';

export default function AppContainer() {
	const theme = useTheme();
	const containerAnim = useAnimatedStyle(
		() => ({
			backgroundColor: withTiming(theme.background),
		}),
		[theme.background],
	);
	return (
		<Container style={containerAnim}>
			<StatusBar backgroundColor={theme.background} barStyle="dark-content" />
			<TimerScreen />
		</Container>
	);
}

const Container = styled(Animated.View)`
	flex: 1;
`;
