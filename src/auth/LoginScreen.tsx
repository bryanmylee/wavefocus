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
			<TopBar>
				<TouchableOpacity onPress={onDismiss}>
					<ThemedIcon name="times" size={42} />
				</TouchableOpacity>
			</TopBar>
			<Centered>
				{isLoading ? (
					<ActivityIndicator color={theme.timer.text} />
				) : user == null || user?.isAnonymous ? (
					<Button title="Sign in with Google" onPress={signInGoogle} />
				) : (
					<>
						<SignedInAs>Signed in as {user.displayName}</SignedInAs>
						<Button title="Sign out" onPress={signOut} />
					</>
				)}
			</Centered>
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

const SignedInAs = styled.Text`
	font-family: Inter;
	font-weight: bold;
	font-size: 24px;
`;
