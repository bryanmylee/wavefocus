import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export interface TimerButtonProps {
	isActive: boolean;
	isDone: boolean;
	onPress?: () => void;
}

export default function PlayPauseButton({
	isActive,
	isDone,
	onPress,
}: TimerButtonProps) {
	const iconName = isActive ? 'pause' : isDone ? 'arrow-right' : 'play';
	return (
		<TouchableOpacity onPress={onPress}>
			<Icon name={iconName} size={42} color="#004f40" />
		</TouchableOpacity>
	);
}
