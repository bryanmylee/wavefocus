import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../auth/UserProvider';
import {FOCUS_DURATION_SEC, RELAX_DURATION_SEC} from '../constants';
import {useElapsedSeconds} from '../utils/useElapsedSeconds';
import {TimerMemory} from './types';

const timerMemoryCollection = firestore().collection<TimerMemory>('timers');

const DEFAULT_MEMORY: TimerMemory = {
	isFocus: true,
	start: null,
	pause: null,
};

interface OnActiveChangePayload {
	isActive: boolean;
	isFocus: boolean;
	secondsRemaining: number;
}

interface UseTimerMemoryProps {
	onActiveChange?: (payload: OnActiveChangePayload) => void;
}

export function useTimerMemory({onActiveChange}: UseTimerMemoryProps = {}) {
	const {
		user,
		subscribeBeforeSignOutAnonymously,
		subscribeAfterSignInAnonymously,
	} = useUser();
	const memoryDoc = useMemo(
		() => timerMemoryCollection.doc(user?.uid ?? ''),
		[user?.uid],
	);
	const [local, setLocal] = useState<TimerMemory>(DEFAULT_MEMORY);

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

	const setIsFocus = useCallback(
		async (isFocus: boolean) => {
			await memoryDoc.set({isFocus, start: null, pause: null});
		},
		[memoryDoc],
	);

	const maxDurationSec = local.isFocus
		? FOCUS_DURATION_SEC
		: RELAX_DURATION_SEC;
	const elapsedSeconds = useElapsedSeconds(
		local.start,
		local.pause,
		maxDurationSec,
	);
	const secondsRemaining = maxDurationSec - elapsedSeconds;
	const isDone = secondsRemaining <= 0;

	/**
	 * isActive
	 */
	const isActive =
		secondsRemaining > 0 && local.start != null && local.pause == null;

	const setIsActive = useCallback(
		async (newIsActive: boolean) => {
			if (secondsRemaining <= 0) {
				return;
			}
			const snapshot = await memoryDoc.get();
			const now = Date.now();
			if (user != null) {
				onActiveChange?.({
					isActive: newIsActive,
					secondsRemaining,
					isFocus: local.isFocus,
				});
			}
			if (newIsActive) {
				if (!snapshot.exists) {
					await memoryDoc.set({...DEFAULT_MEMORY, start: Date.now()});
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					return;
				}
				const start = data.start ?? now;
				const msSincePause = now - (data.pause ?? now);
				await memoryDoc.update({
					pause: null,
					start: start + msSincePause,
				});
			} else {
				if (snapshot.exists) {
					await memoryDoc.update({
						pause: now,
					});
				} else {
					await memoryDoc.set({
						...DEFAULT_MEMORY,
						pause: now,
					});
				}
			}
		},
		[memoryDoc, secondsRemaining, onActiveChange, local.isFocus, user],
	);

	const toggleActive = useCallback(async () => {
		if (secondsRemaining <= 0) {
			return;
		}
		setIsActive(!isActive);
	}, [isActive, setIsActive, secondsRemaining]);

	/**
	 * isReset
	 */
	const isReset = local.isFocus
		? secondsRemaining === FOCUS_DURATION_SEC
		: secondsRemaining === RELAX_DURATION_SEC;

	const resetStage = useCallback(async () => {
		await memoryDoc.set({
			isFocus: local.isFocus,
			start: null,
			pause: null,
		});
	}, [local.isFocus, memoryDoc]);

	const nextStage = useCallback(async () => {
		await setIsFocus(!local.isFocus);
	}, [local.isFocus, setIsFocus]);

	const prevAnonMemory = useRef<TimerMemory>();
	useEffect(
		function savePrevAnonMemory() {
			return subscribeBeforeSignOutAnonymously(async (ev) => {
				const snapshot = await timerMemoryCollection.doc(ev.uid).get();
				prevAnonMemory.current = snapshot.data();
				await timerMemoryCollection.doc(ev.uid).delete();
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
				await timerMemoryCollection
					.doc(ev.user.uid)
					.set(prevAnonMemory.current);
			});
		},
		[subscribeAfterSignInAnonymously],
	);

	return {
		secondsRemaining,
		isDone,
		isActive,
		isReset,
		toggleActive,
		setIsActive,
		isFocus: local.isFocus,
		setIsFocus,
		resetStage,
		nextStage,
	};
}
