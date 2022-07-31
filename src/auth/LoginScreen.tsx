import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import 'react-native-gesture-handler';
import styled from 'styled-components/native';

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({onDismiss}: LoginScreenProps) {
	return (
		<SafeArea>
			<TouchableOpacity onPress={onDismiss}>
				<Text>Dismiss</Text>
			</TouchableOpacity>
			<Text>Hello</Text>
		</SafeArea>
	);
}

const SafeArea = styled.SafeAreaView`
	flex: 1;
	justify-content: center;
`;
