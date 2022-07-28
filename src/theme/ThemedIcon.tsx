import React from 'react';
import Icon, {
	FontAwesome5IconProps,
} from 'react-native-vector-icons/FontAwesome5';
import {useTheme} from 'styled-components/native';

export interface ThemedIconProps extends FontAwesome5IconProps {
	variant?: 'primary';
}

export default function ThemedIcon({
	color,
	variant = 'primary',
	...props
}: ThemedIconProps) {
	const theme = useTheme();
	return <Icon {...props} color={color ?? theme.fill[variant]} />;
}
