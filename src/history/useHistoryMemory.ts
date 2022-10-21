import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../auth/UserProvider';
import {DAY_DURATION_MS, FOCUS_DURATION_SEC} from '../constants';
import {HistoryMemory} from './types';

const historyMemoryCollection =
	firestore().collection<HistoryMemory>('history');

const DEFAULT_MEMORY: HistoryMemory = {};

interface PlayPausePayload {
	isActive: boolean;
	isFocus: boolean;
	secondsRemaining: number;
}

interface Interval {
	start: number;
	end: number;
}

export function useHistoryMemory() {
	const {
		user,
		subscribeBeforeSignOutAnonymously,
		subscribeAfterSignInAnonymously,
	} = useUser();
	const memoryDoc = useMemo(
		() => historyMemoryCollection.doc(user?.uid ?? ''),
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
			const snapshot = await memoryDoc.get();
			if (!snapshot.exists) {
				return;
			}
			const data = snapshot.data();
			if (data == null) {
				return;
			}
			const twoDaysAgo = Date.now() - 2 * DAY_DURATION_MS;
			for (const [start, end] of Object.entries(data)) {
				if (end <= twoDaysAgo) {
					delete data[start];
				}
			}
			await memoryDoc.set(data);
		}
		cleanup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(
		function synchronizeMemory() {
			return memoryDoc.onSnapshot((snapshot) => {
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

	const handlePause = useCallback(
		async (secondsRemaining: number) => {
			const snapshot = await memoryDoc.get();
			if (!snapshot.exists) {
				return;
			}
			const startToEnd = snapshot.data();
			if (startToEnd == null) {
				return;
			}
			const latestStart = Object.keys(startToEnd)
				.map((start) => parseInt(start, 10))
				.sort()
				.at(-1);
			if (latestStart == null) {
				return;
			}
			await memoryDoc.update({
				[latestStart]:
					latestStart + (FOCUS_DURATION_SEC - secondsRemaining) * 1000,
			});
		},
		[memoryDoc],
	);

	const handlePlay = useCallback(
		async (secondsRemaining: number) => {
			const now = Date.now();
			const snapshot = await memoryDoc.get();
			if (!snapshot.exists) {
				await memoryDoc.set({
					[now]: now + FOCUS_DURATION_SEC * 1000,
				});
				return;
			}
			await memoryDoc.update({
				[now]: now + secondsRemaining * 1000,
			});
		},
		[memoryDoc],
	);

	const updateHistoryOnActiveChange = useCallback(
		async ({isActive, isFocus, secondsRemaining}: PlayPausePayload) => {
			if (!isFocus) {
				return;
			}
			if (isActive) {
				await handlePlay(secondsRemaining);
			} else {
				await handlePause(secondsRemaining);
			}
		},
		[handlePlay, handlePause],
	);

	const prevAnonMemory = useRef<HistoryMemory>();
	useEffect(
		function savePrevAnonMemory() {
			return subscribeBeforeSignOutAnonymously(async (ev) => {
				const snapshot = await historyMemoryCollection.doc(ev.uid).get();
				prevAnonMemory.current = snapshot.data();
				await historyMemoryCollection.doc(ev.uid).delete();
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
				await historyMemoryCollection
					.doc(ev.user.uid)
					.set(prevAnonMemory.current);
			});
		},
		[subscribeAfterSignInAnonymously],
	);

	const intervals: Interval[] = useMemo(() => {
		return Object.entries(local).map(([start, end]) => {
			return {
				start: parseInt(start, 10),
				end,
			};
		});
	}, [local]);

	return {
		intervals,
		updateHistoryOnActiveChange,
	};
}
