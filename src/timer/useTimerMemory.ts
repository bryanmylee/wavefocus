import {
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../auth/UserProvider';
import {useInterval} from '../utils/useInterval';
import {TimerMemory, TimerStage} from './types';

const timerMemoryCollection = firestore().collection<TimerMemory>('timers');

const FOCUS_DURATION_SEC = 25 * 60;
const RELAX_DURATION_SEC = 5 * 60;
const DEFAULT_MEMORY: TimerMemory = {
	isFocus: true,
	start: null,
	pause: null,
};

interface Remaining {
	secondsRemaining: number;
	nextDelayMs: number;
}

const getRemaining = (memory: TimerMemory): Remaining => {
	const maxDurationSec = memory.isFocus
		? FOCUS_DURATION_SEC
		: RELAX_DURATION_SEC;
	const end = memory.pause ?? Date.now();
	const start = memory.start ?? Date.now();
	const elapsedMs = end - start;
	const msRemaining = maxDurationSec * 1000 - elapsedMs;
	return {
		secondsRemaining: Math.max(0, Math.floor(msRemaining / 1000)),
		nextDelayMs: 1000 - (elapsedMs % 1000),
	};
};

export function useTimerMemory() {
	const {
		user,
		subscribeBeforeSignOutAnonymously,
		subscribeAfterSignInAnonymously,
	} = useUser();
	const memoryDoc = useMemo(
		() => timerMemoryCollection.doc(user?.uid ?? ''),
		[user?.uid],
	);
	const [local, setMemory] = useState<TimerMemory>(DEFAULT_MEMORY);
	const initialRemaining = useRef(getRemaining(local));
	const [secondsRemaining, setSecondsRemaining] = useState(
		initialRemaining.current.secondsRemaining,
	);
	const [delayMs, setDelayMs] = useState(initialRemaining.current.nextDelayMs);
	const isDone = secondsRemaining <= 0;

	const setLocalMemory = useCallback(
		(memoryAction: SetStateAction<TimerMemory>) => {
			if (memoryAction instanceof Function) {
				setMemory((oldMemory) => {
					const newMemory = memoryAction(oldMemory);
					const remaining = getRemaining(newMemory);
					setSecondsRemaining(remaining.secondsRemaining);
					setDelayMs(remaining.nextDelayMs);
					return newMemory;
				});
			} else {
				setMemory(memoryAction);
				const remaining = getRemaining(memoryAction);
				setSecondsRemaining(remaining.secondsRemaining);
				setDelayMs(remaining.nextDelayMs);
			}
		},
		[],
	);

	useEffect(
		function synchronizeMemory() {
			return memoryDoc.onSnapshot((snapshot) => {
				if (snapshot == null) {
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					setLocalMemory(DEFAULT_MEMORY);
				} else {
					setLocalMemory(data);
				}
			});
		},
		[memoryDoc, setLocalMemory],
	);

	/**
	 * isActive
	 */
	const isActive =
		secondsRemaining > 0 && local.start != null && local.pause == null;

	const setActive = useCallback(
		async (newActive: boolean) => {
			if (secondsRemaining <= 0) {
				return;
			}
			if (newActive) {
				const snapshot = await memoryDoc.get();
				if (!snapshot.exists) {
					await memoryDoc.set({...DEFAULT_MEMORY, start: Date.now()});
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					return;
				}
				const now = Date.now();
				const start = data.start ?? now;
				const msSincePause = now - (data.pause ?? now);
				await memoryDoc.update({
					pause: null,
					start: start + msSincePause,
				});
			} else {
				const snapshot = await memoryDoc.get();
				const now = Date.now();
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
		[memoryDoc, secondsRemaining],
	);

	const toggleActive = useCallback(async () => {
		if (secondsRemaining <= 0) {
			return;
		}
		setActive(!isActive);
	}, [isActive, setActive, secondsRemaining]);

	/**
	 * timerStage
	 */
	const timerStage: TimerStage = local.isFocus ? 'focus' : 'relax';

	const setIsFocus = useCallback(
		async (isFocus: boolean) => {
			await memoryDoc.set({isFocus, start: null, pause: null});
		},
		[memoryDoc],
	);

	const setTimerStage = useCallback(
		(stage: TimerStage) => {
			setIsFocus(stage === 'focus');
		},
		[setIsFocus],
	);

	/**
	 * isReset
	 */
	const isReset =
		timerStage === 'focus'
			? secondsRemaining === FOCUS_DURATION_SEC
			: secondsRemaining === RELAX_DURATION_SEC;

	const resetStage = useCallback(
		async (activeImmediately = true) => {
			const now = Date.now();
			await memoryDoc.set({
				isFocus: local.isFocus,
				start: activeImmediately ? now : null,
				pause: null,
			});
		},
		[local.isFocus, memoryDoc],
	);

	const nextStage = useCallback(
		async (activeImmediately = true) => {
			await setIsFocus(!local.isFocus);
			if (activeImmediately) {
				await setActive(true);
			}
		},
		[local.isFocus, setIsFocus, setActive],
	);

	useInterval(
		() => {
			setSecondsRemaining((s) => s - 1);
			if (delayMs !== 1000) {
				setDelayMs(1000);
			}
		},
		delayMs,
		isActive,
	);

	const [prevAnonMemory, setPrevAnonMemory] = useState<TimerMemory>();
	useEffect(
		function savePrevAnonMemory() {
			return subscribeBeforeSignOutAnonymously(async ({uid}) => {
				const snapshot = await timerMemoryCollection.doc(uid).get();
				setPrevAnonMemory(snapshot.data());
				await timerMemoryCollection.doc(uid).delete();
			});
		},
		[user?.uid, subscribeBeforeSignOutAnonymously],
	);
	useEffect(
		function transferPrevAnonMemory() {
			return subscribeAfterSignInAnonymously(async (ev) => {
				if (prevAnonMemory == null) {
					return;
				}
				if (!ev.prevIsAnon) {
					return;
				}
				await timerMemoryCollection.doc(ev.user.uid).set(prevAnonMemory);
			});
		},
		[subscribeAfterSignInAnonymously, prevAnonMemory],
	);

	return {
		secondsRemaining,
		isDone,
		isActive,
		isReset: isReset,
		toggleActive,
		setActive,
		timerStage,
		setTimerStage,
		resetStage,
		nextStage,
	};
}
