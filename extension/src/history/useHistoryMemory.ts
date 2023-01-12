import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	collection,
	CollectionReference,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
} from 'firebase/firestore';
import {useUser} from '../auth/UserProvider';
import {DAY_DURATION_MS, FOCUS_DURATION_SEC} from '../constants';
import {useFirebase} from '../firebase/FirebaseProvider';
import {HistoryMemory, Interval} from './types';

const DEFAULT_MEMORY: HistoryMemory = {
	history: {},
};

interface PlayPausePayload {
	isActive: boolean;
	isFocus: boolean;
	secondsRemaining: number;
}

export function getIntervalsFromHistory(history: Record<string, number>) {
	return Object.entries(history)
		.map(([start, end]) => {
			return {
				start: parseInt(start, 10),
				end,
			};
		})
		.sort((a, b) => a.start - b.start);
}

export function useHistoryMemory() {
	const {
		user,
		subscribeBeforeSignOutAnonymously,
		subscribeAfterSignInAnonymously,
	} = useUser();
	const {firestore} = useFirebase();
	const historyMemoryCollection = useMemo(
		() =>
			collection(firestore, 'history') as CollectionReference<HistoryMemory>,
		[firestore],
	);
	const memoryDoc = useMemo(
		() => (user?.uid == null ? null : doc(historyMemoryCollection, user.uid)),
		[user?.uid],
	);
	const [local, setLocal] = useState<HistoryMemory>(DEFAULT_MEMORY);

	/**
	 * We only want to keep history data for up to 2 days.
	 *
	 * We run this client-side to reduce the load on our serverless functions.
	 * This poses a risk of leaving stale data behind if a user does not launch
	 * the application in awhile. However, non-active users will eventually be
	 * cleaned up by a serverless function so it is okay if we miss some users.
	 */
	useEffect(function cleanupOldHistory() {
		async function cleanup() {
			if (memoryDoc == null) return;
			const snapshot = await getDoc(memoryDoc);
			if (!snapshot.exists()) {
				return;
			}
			const data = snapshot.data();
			if (data == null) {
				return;
			}
			if (data.history == null) {
				data.history = {};
			}
			const twoDaysAgo = Date.now() - 2 * DAY_DURATION_MS;
			for (const [start, end] of Object.entries(data.history)) {
				if (end <= twoDaysAgo) {
					delete data.history[start];
				}
			}
			await setDoc(memoryDoc, data);
		}
		cleanup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(
		function synchronizeMemory() {
			if (memoryDoc == null) return;
			return onSnapshot(memoryDoc, (snapshot) => {
				if (snapshot == null) {
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					setLocal(DEFAULT_MEMORY);
				} else {
					setLocal(data);
				}
			});
		},
		[memoryDoc],
	);

	const handlePause = useCallback(async () => {
		if (memoryDoc == null) return;
		const snapshot = await getDoc(memoryDoc);
		if (!snapshot.exists()) {
			return;
		}
		const data = snapshot.data();
		if (data == null) {
			return;
		}
		const starts = Object.keys(data.history ?? {})
			.map((start) => parseInt(start, 10))
			.sort();
		const latestStart = starts[starts.length - 1];
		if (latestStart == null) {
			return;
		}
		const now = Date.now();
		const newMemory = {
			history: {
				...data?.history,
				[latestStart]: now,
			},
		};
		await setDoc(memoryDoc, newMemory);
		return newMemory;
	}, [memoryDoc]);

	const handlePlay = useCallback(
		async (secondsRemaining: number) => {
			if (memoryDoc == null) return;
			const now = Date.now();
			const snapshot = await getDoc(memoryDoc);
			if (!snapshot.exists()) {
				await setDoc(memoryDoc, {
					history: {
						[now]: now + FOCUS_DURATION_SEC * 1000,
					},
				});
				return;
			}
			const data = snapshot.data();
			const newMemory = {
				history: {
					...data?.history,
					[now]: now + secondsRemaining * 1000,
				},
			};
			await setDoc(memoryDoc, newMemory);
			return newMemory;
		},
		[memoryDoc],
	);

	const updateHistoryOnActiveChange = useCallback(
		async ({isActive, isFocus, secondsRemaining}: PlayPausePayload) => {
			if (!isFocus) {
				return;
			}
			if (isActive) {
				return await handlePlay(secondsRemaining);
			} else {
				return await handlePause();
			}
		},
		[handlePlay, handlePause],
	);

	const resetHistory = useCallback(() => {
		if (memoryDoc == null) return;
		setDoc(memoryDoc, {
			history: {},
		});
	}, [memoryDoc]);

	const prevAnonMemory = useRef<HistoryMemory>();
	useEffect(
		function savePrevAnonMemory() {
			return subscribeBeforeSignOutAnonymously(async (ev) => {
				const historyDoc = doc(historyMemoryCollection, ev.uid);
				const snapshot = await getDoc(historyDoc);
				prevAnonMemory.current = snapshot.data();
				await deleteDoc(historyDoc);
			});
		},
		[subscribeBeforeSignOutAnonymously],
	);
	useEffect(
		function transferPrevAnonMemory() {
			return subscribeAfterSignInAnonymously(async (ev) => {
				if (prevAnonMemory.current == null) {
					return;
				}
				if (!ev.prevIsAnon) {
					return;
				}
				const historyDoc = doc(historyMemoryCollection, ev.user.uid);
				await setDoc(historyDoc, prevAnonMemory.current);
			});
		},
		[subscribeAfterSignInAnonymously],
	);

	const intervals: Interval[] = useMemo(() => {
		return getIntervalsFromHistory(local.history);
	}, [local.history]);

	return {
		intervals,
		resetHistory,
		updateHistoryOnActiveChange,
	};
}
