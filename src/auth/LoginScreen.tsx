import React from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import 'react-native-gesture-handler';
import styled, {useTheme} from 'styled-components/native';
import Button from '../components/Button';
import Centered from '../components/Centered';
import FixedSafeAreaView from '../components/FixedSafeAreaView';
import ThemedIcon from '../theme/ThemedIcon';
import {useBackHandler} from '../utils/useBackHandler';
import {useUser} from './UserProvider';

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({onDismiss}: LoginScreenProps) {
	const {user, isLoading, signInGoogle, signOut} = useUser();

	useBackHandler(() => {
		onDismiss?.();
		return true;
	}, [onDismiss]);

	const theme = useTheme();

	return (
		<FixedSafeAreaView>
			<Bar>
				<TouchableOpacity onPress={onDismiss}>
					<ThemedIcon name="times" size={42} />
				</TouchableOpacity>
			</Bar>
			<Centered>
				{isLoading ? (
					<ActivityIndicator color={theme.timer.text} />
				) : user == null || user?.isAnonymous ? (
					<Button title="Sign in with Google" onPress={signInGoogle} />
				) : (
					<>
						<UsernameText>Signed in as {user.displayName}</UsernameText>
						<EmailText>{user.email}</EmailText>
						<Button title="Sign out" onPress={signOut} />
					</>
				)}
			</Centered>
		</FixedSafeAreaView>
	);
}

const Bar = styled.View`
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 42px;
	padding-right: 42px;
	padding-top: 32px;
`;

const UsernameText = styled.Text`
	font-family: Inter;
	font-weight: 600;
	font-size: 24px;
	margin-bottom: 16px;
`;

const EmailText = styled.Text`
	font-family: Inter;
	font-weight: 500;
	font-size: 16px;
	opacity: 0.5;
	margin-bottom: 24px;
`;
