import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';

export interface TimerButtonProps {
	onPress?: () => void;
}

export default function ResetButton({onPress}: TimerButtonProps) {
	return (
		<Button onPress={onPress}>
			<Icon name="undo" size={42} color="#004f40" />
		</Button>
	);
}

const Button = styled.TouchableOpacity``;
