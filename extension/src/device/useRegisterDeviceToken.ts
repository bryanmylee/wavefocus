import {useEffect, useRef} from 'react';
import {
	collection,
	CollectionReference,
	doc,
	Firestore,
	getDoc,
	setDoc,
} from 'firebase/firestore';
import browser from 'webextension-polyfill';
import {useUser} from '../auth/UserProvider';
import {useFirebase} from '../firebase/FirebaseProvider';

interface DeviceMemory {
	tokens: string[];
}

export function useRegisterDeviceToken() {
	const {firestore} = useFirebase();
	const {user} = useUser();
	const token = useRef<string>();

	useEffect(
		function loadToken() {
			async function load() {
				if (user == null) return;
				const {fcm_token} = await browser.storage.local.get(['fcm_token']);
				console.log('loaded token', fcm_token, 'user', user.uid);
				await updateDeviceTokenMemory(
					firestore,
					user.uid,
					fcm_token,
					token.current,
				);
				token.current = fcm_token;
			}
			load();
		},
		[firestore, user],
	);
}

async function updateDeviceTokenMemory(
	firestore: Firestore,
	userId: string,
	token: string,
	oldToken?: string,
) {
	const deviceMemoryCollection = collection(
		firestore,
		'devices',
	) as CollectionReference<DeviceMemory>;
	const docRef = doc(deviceMemoryCollection, userId);
	const snapshot = await getDoc(docRef);
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
	await setDoc(docRef, {tokens});
}
