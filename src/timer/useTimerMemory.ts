import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useInterval} from '../utils/useInterval';
import {TTimerMemory, TTimerStage} from './TTimerMemory';

const timerMemoryCollection = firestore().collection<TTimerMemory>('timers');

const MAX_FOCUS_TIME_SEC = /*25 * 60*/ 6;
const MAX_RELAX_TIME_SEC = /*5 * 60*/ 3;
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
	const timerStage: TTimerStage = memory.isFocus ? 'focus' : 'relax';

	const setTogglesAndFirestore = useCallback(
		async (toggles: number[], updateFirestore = true) => {
			setMemory((oldMemory) => {
				const newMemory = {...oldMemory, toggles};
				const remaining = getRemaining(newMemory);
				setSecondsRemaining(remaining.secondsRemaining);
				setDelayMs(remaining.nextDelayMs);
				return newMemory;
			});
			if (updateFirestore) {
				const snapshot = await memoryDoc.get();
				if (snapshot.exists) {
					memoryDoc.update({toggles});
				} else {
					memoryDoc.set({...DEFAULT_MEMORY, toggles});
				}
			}
		},
		[memoryDoc],
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
			setMemory((oldMemory) => {
				return {...oldMemory, isFocus};
			});
			if (updateFirestore) {
				const snapshot = await memoryDoc.get();
				if (snapshot.exists) {
					memoryDoc.update({isFocus});
				} else {
					memoryDoc.set({...DEFAULT_MEMORY, isFocus});
				}
			}
		},
		[memoryDoc],
	);

	const setTimerStage = useCallback(
		(stage: TTimerStage) => {
			setIsFocusAndFirestore(stage === 'focus');
		},
		[setIsFocusAndFirestore],
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
		isActive,
		toggleActive,
		setActive,
		timerStage,
		setTimerStage,
	};
};
