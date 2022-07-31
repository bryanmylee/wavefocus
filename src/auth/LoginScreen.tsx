import React from 'react';
import {Text} from 'react-native';
import 'react-native-gesture-handler';
import styled from 'styled-components/native';

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({}: LoginScreenProps) {
	return (
		<SafeArea>
			<Text>Hello</Text>
		</SafeArea>
	);
}

const SafeArea = styled.SafeAreaView`
	flex: 1;
	justify-content: center;
`;
