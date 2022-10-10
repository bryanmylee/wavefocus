import {
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useInterval} from '../utils/useInterval';
import {TTimerMemory, TTimerStage} from './types';

const timerMemoryCollection = firestore().collection<TTimerMemory>('timers');

const FOCUS_DURATION_SEC = 25 * 60;
const RELAX_DURATION_SEC = 5 * 60;
const DEFAULT_MEMORY: TTimerMemory = {
	isFocus: true,
	start: Date.now(),
	pause: null,
};

interface TRemaining {
	secondsRemaining: number;
	nextDelayMs: number;
}

const getRemaining = (memory: TTimerMemory): TRemaining => {
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

export const useTimerMemory = (userId: string) => {
	const memoryDoc = useMemo(() => timerMemoryCollection.doc(userId), [userId]);
	const [local, setMemory] = useState<TTimerMemory>(DEFAULT_MEMORY);
	const initialRemaining = useRef(getRemaining(local));
	const [secondsRemaining, setSecondsRemaining] = useState(
		initialRemaining.current.secondsRemaining,
	);
	const [delayMs, setDelayMs] = useState(initialRemaining.current.nextDelayMs);
	const isDone = secondsRemaining <= 0;

	const setLocalMemory = useCallback(
		(memoryAction: SetStateAction<TTimerMemory>) => {
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
				const data = snapshot.data();
				if (data === undefined) {
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
					return;
				}
				const data = snapshot.data();
				if (data === undefined) {
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
	const timerStage: TTimerStage = local.isFocus ? 'focus' : 'relax';

	const setIsFocus = useCallback(
		async (isFocus: boolean) => {
			await memoryDoc.set({isFocus, start: null, pause: null});
		},
		[memoryDoc],
	);

	const setTimerStage = useCallback(
		(stage: TTimerStage) => {
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
};
