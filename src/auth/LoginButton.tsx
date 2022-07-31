import React from 'react';
import styled from 'styled-components/native';
import ThemedIcon from '../theme/ThemedIcon';

export interface TimerButtonProps {
	isLoggedIn: boolean;
	onPress?: () => void;
}

export default function LoginButton({isLoggedIn, onPress}: TimerButtonProps) {
	return (
		<FixedWidthOpacity onPress={onPress}>
			<ThemedIcon name={isLoggedIn ? 'user-check' : 'user'} solid size={36} />
		</FixedWidthOpacity>
	);
}

const FixedWidthOpacity = styled.TouchableOpacity`
	width: 48px;
`;
