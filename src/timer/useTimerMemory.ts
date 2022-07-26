import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useInterval} from '../utils/useInterval';
import {TTimerMemory} from './TTimerMemory';

const timerMemoryCollection = firestore().collection<TTimerMemory>('timers');

const MAX_ACTIVE_TIME_SEC = 25 * 60;
const DEFAULT_MEMORY: TTimerMemory = {
	toggles: [],
};

interface TRemaining {
	secondsRemaining: number;
	nextDelayMs: number;
}

const getRemaining = (toggles: number[]): TRemaining => {
	if (toggles.length === 0) {
		return {secondsRemaining: MAX_ACTIVE_TIME_SEC, nextDelayMs: 1000};
	}
	let elapsedMs = 0;
	let startMs: number | undefined;
	for (const timestamp of toggles) {
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
			MAX_ACTIVE_TIME_SEC - Math.floor(elapsedMs / 1000),
		),
		nextDelayMs: 1000 - (elapsedMs % 1000),
	};
};

export const useTimerMemory = (userId: string) => {
	const memoryDoc = useMemo(() => timerMemoryCollection.doc(userId), [userId]);
	const [memory, setMemory] = useState<TTimerMemory>(DEFAULT_MEMORY);
	const initialRemaining = useRef(getRemaining(memory.toggles));
	const [secondsRemaining, setSecondsRemaining] = useState(
		initialRemaining.current.secondsRemaining,
	);
	const [delayMs, setDelayMs] = useState(initialRemaining.current.nextDelayMs);
	const isActive = secondsRemaining > 0 && memory.toggles.length % 2 === 1;

	const setMemoryAndSeconds = useCallback((newMemory: TTimerMemory) => {
		setMemory(newMemory);
		const remaining = getRemaining(newMemory.toggles);
		setSecondsRemaining(remaining.secondsRemaining);
		setDelayMs(remaining.nextDelayMs);
	}, []);

	const toggleActive = useCallback(() => {
		if (secondsRemaining <= 0) {
			return;
		}
		const newMemory: TTimerMemory = {
			...memory,
			toggles: [...memory.toggles, Date.now()],
		};
		setMemoryAndSeconds(newMemory);
		memoryDoc.set(newMemory);
	}, [memory, memoryDoc, secondsRemaining, setMemoryAndSeconds]);

	const setActive = useCallback(
		(newActive: boolean) => {
			if (isActive !== newActive) {
				toggleActive();
			}
		},
		[isActive, toggleActive],
	);

	useEffect(
		function synchronizeMemory() {
			return memoryDoc.onSnapshot((snapshot) => {
				setMemoryAndSeconds(snapshot.data() ?? DEFAULT_MEMORY);
			});
		},
		[memoryDoc, setMemoryAndSeconds],
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
	};
};
