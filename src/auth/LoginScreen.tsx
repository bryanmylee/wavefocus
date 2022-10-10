import React, {useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Button, Text} from 'react-native';
import 'react-native-gesture-handler';
import styled from 'styled-components/native';
import DismissButton from '../core/DismissButton';
import FixedSafeAreaView from '../core/FixedSafeAreaView';
import {useBackHandler} from '../utils/useBackHandler';
import {useUser} from './UserProvider';

GoogleSignin.configure({
	webClientId:
		'843057937567-v8tqhtkak5qmvnjf5j873dkn2svugn19.apps.googleusercontent.com',
});

async function onGoogleButtonPress() {
	const {idToken} = await GoogleSignin.signIn();
	const googleCredential = auth.GoogleAuthProvider.credential(idToken);
	return auth().signInWithCredential(googleCredential);
}

interface LoginScreenProps {
	onDismiss?: () => void;
}

export default function LoginScreen({onDismiss}: LoginScreenProps) {
	const {user} = useUser();

	useBackHandler(() => {
		onDismiss?.();
		return true;
	}, [onDismiss]);

	const onLoginButtonPress = useCallback(async () => {
		await onGoogleButtonPress();
		onDismiss?.();
	}, [onDismiss]);

	const onLogoutButtonPress = useCallback(async () => {
		await auth().signOut();
		onDismiss?.();
	}, [onDismiss]);

	return (
		<FixedSafeAreaView>
			<TopBar>
				<DismissButton onPress={onDismiss} />
			</TopBar>
			<LoginFormContainer>
				{user == null || user.isAnonymous ? (
					<Button title="Sign in with Google" onPress={onLoginButtonPress} />
				) : (
					<>
						<Text>Signed in as {user.displayName}</Text>
						<Button title="Sign out" onPress={onLogoutButtonPress} />
					</>
				)}
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
