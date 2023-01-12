import {useEffect, useMemo} from 'react';
import {User} from 'firebase/auth';
import {collection, CollectionReference, doc, setDoc} from 'firebase/firestore';
import {useFirebase} from '../firebase/FirebaseProvider';

interface LastActiveMemory {
	timestamp: number;
}

export function useLastActive(user?: User | null) {
	const {firestore} = useFirebase();
	const lastActiveMemoryCollection = useMemo(
		() =>
			collection(
				firestore,
				'last-active',
			) as CollectionReference<LastActiveMemory>,
		[],
	);
	const memoryDoc = useMemo(
		() => (user == null ? null : doc(lastActiveMemoryCollection, user.uid)),
		[user?.uid],
	);
	useEffect(
		function updateLastActive() {
			if (memoryDoc == null) {
				return;
			}
			setDoc(memoryDoc, {
				timestamp: Date.now(),
			});
		},
		[memoryDoc],
	);
}
