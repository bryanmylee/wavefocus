import {useEffect, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {useUser} from '../auth/UserProvider';

interface DeviceMemory {
	tokens: string[];
}

export function useRegisterDeviceToken() {
	const {user} = useUser();
	const token = useRef<string>();
	useEffect(
		function saveInitialToken() {
			async function saveToken() {
				if (user == null) {
					return;
				}
				token.current = await messaging().getToken();
				await updateDeviceTokenMemory(user.uid, token.current);
			}
			saveToken();
		},
		[user],
	);
	useEffect(
		function syncToken() {
			return messaging().onTokenRefresh(async (newToken) => {
				if (user == null) {
					return;
				}
				await updateDeviceTokenMemory(user.uid, newToken, token.current);
				token.current = newToken;
			});
		},
		[user],
	);
}

const deviceMemoryCollection = firestore().collection<DeviceMemory>('devices');

async function updateDeviceTokenMemory(
	userId: string,
	token: string,
	oldToken?: string,
) {
	const snapshot = await deviceMemoryCollection.doc(userId).get();
	const data = snapshot.data();
	const tokens = data?.tokens ?? [];
	// Remove old token.
	const idx = tokens.findIndex((t) => t === oldToken);
	if (idx !== -1) {
		tokens.splice(idx, 1);
	}
	// Add new token.
	if (tokens.includes(token)) {
		return;
	}
	tokens.push(token);
	// Update token memory
	await snapshot.ref.set({tokens});
}
