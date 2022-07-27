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
import {TTimerMemory, TTimerStage} from './TTimerMemory';

const timerMemoryCollection = firestore().collection<TTimerMemory>('timers');

const MAX_FOCUS_TIME_SEC = 25 * 60;
const MAX_RELAX_TIME_SEC = 5 * 60;
const DEFAULT_MEMORY: TTimerMemory = {
	isFocus: true,
	toggles: [],
};

interface TRemaining {
	secondsRemaining: number;
	nextDelayMs: number;
}

const getRemaining = (memory: TTimerMemory): TRemaining => {
	const maxSecondsRemaining = memory.isFocus
		? MAX_FOCUS_TIME_SEC
		: MAX_RELAX_TIME_SEC;
	if (memory.toggles.length === 0) {
		return {
			secondsRemaining: maxSecondsRemaining,
			nextDelayMs: 1000,
		};
	}
	let elapsedMs = 0;
	let startMs: number | undefined;
	for (const timestamp of memory.toggles) {
		if (startMs === undefined) {
			startMs = timestamp;
		} else {
			elapsedMs += timestamp - startMs;
			startMs = undefined;
		}
	}
	if (startMs !== undefined) {
		elapsedMs += Date.now() - startMs;
	}
	return {
		secondsRemaining: Math.max(
			0,
			maxSecondsRemaining - Math.floor(elapsedMs / 1000),
		),
		nextDelayMs: 1000 - (elapsedMs % 1000),
	};
};

export const useTimerMemory = (userId: string) => {
	const memoryDoc = useMemo(() => timerMemoryCollection.doc(userId), [userId]);
	const [memory, setMemory] = useState<TTimerMemory>(DEFAULT_MEMORY);
	const initialRemaining = useRef(getRemaining(memory));
	const [secondsRemaining, setSecondsRemaining] = useState(
		initialRemaining.current.secondsRemaining,
	);
	const [delayMs, setDelayMs] = useState(initialRemaining.current.nextDelayMs);
	const isActive = secondsRemaining > 0 && memory.toggles.length % 2 === 1;
	const isDone = secondsRemaining <= 0;
	const timerStage: TTimerStage = memory.isFocus ? 'focus' : 'relax';
	const isReset =
		timerStage === 'focus'
			? secondsRemaining === MAX_FOCUS_TIME_SEC
			: secondsRemaining === MAX_RELAX_TIME_SEC;

	const setMemoryUpdateRemaining = useCallback(
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

	const setTogglesAndFirestore = useCallback(
		async (toggles: number[], updateFirestore = true) => {
			setMemoryUpdateRemaining((oldMemory) => ({...oldMemory, toggles}));
			if (updateFirestore) {
				const snapshot = await memoryDoc.get();
				if (snapshot.exists) {
					memoryDoc.update({toggles});
				} else {
					memoryDoc.set({...DEFAULT_MEMORY, toggles});
				}
			}
		},
		[memoryDoc, setMemoryUpdateRemaining],
	);

	const toggleActive = useCallback(() => {
		if (secondsRemaining <= 0) {
			return;
		}
		const newToggles = [...memory.toggles, Date.now()];
		setTogglesAndFirestore(newToggles);
	}, [memory, secondsRemaining, setTogglesAndFirestore]);

	const setActive = useCallback(
		(newActive: boolean) => {
			if (isActive !== newActive) {
				toggleActive();
			}
		},
		[isActive, toggleActive],
	);

	const setIsFocusAndFirestore = useCallback(
		async (isFocus: boolean, updateFirestore = true) => {
			setMemoryUpdateRemaining((oldMemory) => ({...oldMemory, isFocus}));
			if (updateFirestore) {
				const snapshot = await memoryDoc.get();
				if (snapshot.exists) {
					memoryDoc.update({isFocus});
				} else {
					memoryDoc.set({...DEFAULT_MEMORY, isFocus});
				}
			}
		},
		[memoryDoc, setMemoryUpdateRemaining],
	);

	const setTimerStage = useCallback(
		(stage: TTimerStage) => {
			setIsFocusAndFirestore(stage === 'focus');
		},
		[setIsFocusAndFirestore],
	);

	const resetStage = useCallback(
		(activeImmediately = true) => {
			setTogglesAndFirestore(activeImmediately ? [Date.now()] : []);
		},
		[setTogglesAndFirestore],
	);

	const nextStage = useCallback(
		(activeImmediately = true) => {
			setIsFocusAndFirestore(!memory.isFocus);
			resetStage(activeImmediately);
		},
		[memory.isFocus, resetStage, setIsFocusAndFirestore],
	);

	useEffect(
		function synchronizeMemory() {
			return memoryDoc.onSnapshot((snapshot) => {
				const data = snapshot.data();
				if (data === undefined) {
					setTogglesAndFirestore(DEFAULT_MEMORY.toggles, false);
					setIsFocusAndFirestore(DEFAULT_MEMORY.isFocus, false);
					return;
				}
				setTogglesAndFirestore(data.toggles, false);
				setIsFocusAndFirestore(data.isFocus, false);
			});
		},
		[memoryDoc, setIsFocusAndFirestore, setTogglesAndFirestore],
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
		isReset,
		toggleActive,
		setActive,
		timerStage,
		setTimerStage,
		resetStage,
		nextStage,
	};
};