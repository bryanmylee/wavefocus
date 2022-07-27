import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styled from 'styled-components/native';

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
		<Button onPress={onPress}>
			<Icon name={iconName} size={42} color="#004f40" />
		</Button>
	);
}

const Button = styled.TouchableOpacity``;
