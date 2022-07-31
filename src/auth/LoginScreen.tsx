import React from 'react';
import 'react-native-gesture-handler';
import styled from 'styled-components/native';
import DismissButton from '../core/DismissButton';
import FixedSafeAreaView from '../core/FixedSafeAreaView';
import TextInput from '../core/TextInput';

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({onDismiss}: LoginScreenProps) {
	return (
		<FixedSafeAreaView>
			<TopBar>
				<DismissButton onPress={onDismiss} />
			</TopBar>
			<LoginFormContainer>
				<TextInput value="Hello" />
			</LoginFormContainer>
		</FixedSafeAreaView>
	);
}

const TopBar = styled.View`
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 42px;
	padding-right: 42px;
	padding-top: 32px;
`;

const LoginFormContainer = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
`;
