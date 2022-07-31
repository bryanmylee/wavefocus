import React from 'react';
import {TouchableOpacity} from 'react-native';
import ThemedIcon from '../theme/ThemedIcon';

export interface TimerButtonProps {
	onPress?: () => void;
}

export default function DismissButton({onPress}: TimerButtonProps) {
	return (
		<TouchableOpacity onPress={onPress}>
			<ThemedIcon name="times" size={42} />
		</TouchableOpacity>
	);
}
