import React from 'react';
import {TouchableOpacity} from 'react-native';
import ThemedIcon from '../theme/ThemedIcon';

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
			<ThemedIcon name={iconName} size={42} />
		</TouchableOpacity>
	);
}
