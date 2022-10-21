import React from 'react';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import Icon, {
	FontAwesome5IconProps,
} from 'react-native-vector-icons/FontAwesome5';
import {useTheme} from 'styled-components/native';

export interface ThemedIconProps extends FontAwesome5IconProps {
	color?: string;
}

export default function ThemedIcon({color, ...props}: ThemedIconProps) {
	const theme = useTheme();
	const iconAnim = useAnimatedStyle(
		() => ({
			color: withTiming(color ?? theme.fill.primary),
		}),
		[color, theme.fill],
	);
	return <AnimatedIcon {...props} style={iconAnim} />;
}

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
