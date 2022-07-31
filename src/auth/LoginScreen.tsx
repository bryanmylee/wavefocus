import React, {useState} from 'react';
import 'react-native-gesture-handler';
import styled from 'styled-components/native';
import DismissButton from '../core/DismissButton';
import FixedSafeAreaView from '../core/FixedSafeAreaView';
import StyledTextInput from '../core/StyledTextInput';
import {useBackHandler} from '../utils/useBackHandler';

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({onDismiss}: LoginScreenProps) {
	const [email, setEmail] = useState('');
	useBackHandler(() => {
		onDismiss?.();
		return true;
	}, [onDismiss]);
	return (
		<FixedSafeAreaView>
			<TopBar>
				<DismissButton onPress={onDismiss} />
			</TopBar>
			<LoginFormContainer>
				<StyledTextInput value={email} onChangeText={setEmail} width="80%" />
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
