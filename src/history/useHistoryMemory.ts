import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../auth/UserProvider';
import {FOCUS_DURATION_SEC} from '../constants';
import {HistoryMemory} from './types';

const historyMemoryCollection =
	firestore().collection<HistoryMemory>('history');

const DEFAULT_MEMORY: HistoryMemory = {};

interface PlayPausePayload {
	isActive: boolean;
	isFocus: boolean;
	secondsRemaining: number;
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

	return {
		intervals: local,
		updateHistoryOnActiveChange,
	};
}
