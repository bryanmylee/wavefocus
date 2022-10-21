import {useEffect, useMemo} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface LastActiveMemory {
	timestamp: number;
}

const lastActiveMemoryCollection =
	firestore().collection<LastActiveMemory>('last-active');

export function useLastActive(user?: FirebaseAuthTypes.User | null) {
	const memoryDoc = useMemo(
		() => lastActiveMemoryCollection.doc(user?.uid ?? ''),
		[user?.uid],
	);
	useEffect(
		function updateLastActive() {
			memoryDoc.set({
				timestamp: Date.now(),
			});
		},
		[memoryDoc],
	);
}
