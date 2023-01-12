import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	collection,
	CollectionReference,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import browser from 'webextension-polyfill';
import {useUser} from '../auth/UserProvider';
import {FOCUS_DURATION_SEC, RELAX_DURATION_SEC} from '../constants';
import {useFirebase} from '../firebase/FirebaseProvider';
import {useElapsedSeconds} from '../utils/useElapsedSeconds';
import {TimerMemory} from './types';

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

async function saveLocalToStorage(timer: TimerMemory) {
	await browser.storage.local.set({timer});
}

async function getLocalFromStorage() {
	const {timer} = await browser.storage.local.get(['timer']);
	console.log('in storage', timer);
	return (timer ?? DEFAULT_MEMORY) as TimerMemory;
}

export function useTimerMemory({onActiveChange}: UseTimerMemoryProps = {}) {
	const {firestore} = useFirebase();
	const timerMemoryCollection = useMemo(
		() => collection(firestore, 'timers') as CollectionReference<TimerMemory>,
		[firestore],
	);
	const {
		user,
		subscribeBeforeSignOutAnonymously,
		subscribeAfterSignInAnonymously,
	} = useUser();
	const memoryDoc = useMemo(
		() => (user?.uid == null ? null : doc(timerMemoryCollection, user.uid)),
		[user?.uid],
	);
	const [local, setLocal] = useState<TimerMemory>(DEFAULT_MEMORY);

	useEffect(function loadInitialFromStorage() {
		async function load() {
			setLocal(await getLocalFromStorage());
		}
		load();
	}, []);

	useEffect(
		function synchronizeMemory() {
			if (memoryDoc == null) return;
			return onSnapshot(memoryDoc, (snapshot) => {
				if (snapshot == null) {
					return;
				}
				const data = snapshot.data();
				const resolvedData = data ?? DEFAULT_MEMORY;
				setLocal(resolvedData);
				saveLocalToStorage(resolvedData);
			});
		},
		[memoryDoc],
	);

	const setIsFocus = useCallback(
		async (isFocus: boolean) => {
			if (memoryDoc == null) return;
			await setDoc(memoryDoc, {isFocus, start: null, pause: null});
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
			if (memoryDoc == null) return;
			if (secondsRemaining <= 0) return;
			const snapshot = await getDoc(memoryDoc);
			const now = Date.now();
			if (user != null) {
				onActiveChange?.({
					isActive: newIsActive,
					secondsRemaining,
					isFocus: local.isFocus,
				});
			}
			if (newIsActive) {
				if (!snapshot.exists()) {
					await setDoc(memoryDoc, {...DEFAULT_MEMORY, start: Date.now()});
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					return;
				}
				const start = data.start ?? now;
				const msSincePause = now - (data.pause ?? now);
				await updateDoc(memoryDoc, {
					pause: null,
					start: start + msSincePause,
				});
			} else {
				if (snapshot.exists()) {
					await updateDoc(memoryDoc, {
						pause: now,
					});
				} else {
					await setDoc(memoryDoc, {
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
		if (memoryDoc == null) return;
		await setDoc(memoryDoc, {
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
				const timerDoc = doc(timerMemoryCollection, ev.uid);
				const snapshot = await getDoc(timerDoc);
				prevAnonMemory.current = snapshot.data();
				await deleteDoc(timerDoc);
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
				const timerDoc = doc(timerMemoryCollection, ev.user.uid);
				await setDoc(timerDoc, prevAnonMemory.current);
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
