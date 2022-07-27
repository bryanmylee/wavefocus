import React from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export interface TimerButtonProps {
	onPress?: () => void;
}

export default function NextButton({onPress}: TimerButtonProps) {
	return (
		<TouchableOpacity onPress={onPress}>
			<Icon name="arrow-right" size={42} color="#004f40" />
		</TouchableOpacity>
	);
}
