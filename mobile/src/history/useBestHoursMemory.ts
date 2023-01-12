import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import {useUser} from '../auth/UserProvider';
import {BestHoursMemory, Period, Interval} from './types';

const bestHoursMemoryCollection =
	firestore().collection<BestHoursMemory>('best-hours');

const GET_DEFAULT_MEMORY = (): BestHoursMemory => ({
	pendingStart: null,
	pendingEnd: null,
	scores: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	],
});

function getUpdatedScores(
	scores: number[],
	start: dayjs.Dayjs,
	end: dayjs.Dayjs,
) {
	const newScores = [...scores];
	// Account for durations that span across two separate hour buckets.
	if (start.hour() === end.hour()) {
		newScores[start.hour()] += getMinsBetween(start, end);
	} else {
		const between = start.endOf('hour');
		newScores[start.hour()] += getMinsBetween(start, between);
		newScores[end.hour()] += getMinsBetween(between, end);
	}
	return newScores;
}

function getMinsBetween(start: dayjs.Dayjs, end: dayjs.Dayjs) {
	return (end.unix() - start.unix()) / 60;
}

const getBestHour = (scores: number[]) => {
	let maxIndex = 0;
	let maxScore = 0;
	for (let i = 0; i < scores.length; i++) {
		if (scores[i] > maxScore) {
			maxIndex = i;
			maxScore = scores[i];
		}
	}
	return maxIndex;
};

const getPeriod = (bestHour: number): Period => {
	if (bestHour <= 4) {
		return 'late-night';
	}
	if (bestHour <= 7) {
		return 'early-morning';
	}
	if (bestHour <= 11) {
		return 'morning';
	}
	if (bestHour <= 13) {
		return 'noon';
	}
	if (bestHour <= 16) {
		return 'afternoon';
	}
	if (bestHour <= 19) {
		return 'evening';
	}
	return 'night';
};

interface UpdateBestHoursPayload {
	isActive: boolean;
	latestInterval: Interval;
}

export function useBestHoursMemory() {
	const {
		user,
		subscribeAfterSignInAnonymously,
		subscribeBeforeSignOutAnonymously,
	} = useUser();
	const memoryDoc = useMemo(
		() => bestHoursMemoryCollection.doc(user?.uid ?? ''),
		[user?.uid],
	);
	const [local, setLocal] = useState<BestHoursMemory>(GET_DEFAULT_MEMORY);

	useEffect(
		function synchronizeMemory() {
			return memoryDoc.onSnapshot((snapshot) => {
				if (snapshot == null) {
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					setLocal(GET_DEFAULT_MEMORY());
				} else {
					setLocal(data);
				}
			});
		},
		[memoryDoc],
	);

	const updateBestHoursOnActiveChange = useCallback(
		async ({isActive, latestInterval}: UpdateBestHoursPayload) => {
			async function setPendingInitial() {
				await memoryDoc.set({
					...GET_DEFAULT_MEMORY(),
					pendingStart: latestInterval?.start ?? null,
					pendingEnd: latestInterval?.end ?? null,
				});
			}
			async function setPendingWithoutCommit() {
				await memoryDoc.update({
					pendingStart: latestInterval?.start ?? null,
					pendingEnd: latestInterval?.end ?? null,
				});
			}
			async function setPendingWithCommit(
				scores: number[],
				pendingStart: number,
				pendingEnd: number,
			) {
				const newScores = getUpdatedScores(
					scores,
					dayjs(pendingStart),
					dayjs(pendingEnd),
				);
				await memoryDoc.update({
					pendingStart: latestInterval?.start,
					pendingEnd: latestInterval?.end,
					scores: newScores,
				});
			}
			/**
			 * After a timer completes, it is possible to trigger a play event while
			 * a pending start/end exists. Make sure to commit any pending start/end
			 * before updating.
			 */
			async function setPending() {
				const snapshot = await memoryDoc.get();
				if (!snapshot.exists) {
					return await setPendingInitial();
				}
				const data = snapshot.data();
				if (data == null) {
					return await setPendingInitial();
				}
				const {scores, pendingEnd, pendingStart} = data;
				if (pendingStart == null || pendingEnd == null) {
					return await setPendingWithoutCommit();
				}
				const now = Date.now();
				if (pendingEnd > now) {
					return await setPendingWithoutCommit();
				}
				return await setPendingWithCommit(scores, pendingStart, pendingEnd);
			}
			async function commitPending() {
				const pendingStart = local.pendingStart;
				if (pendingStart == null) {
					return;
				}
				const snapshot = await memoryDoc.get();
				if (!snapshot.exists) {
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					return;
				}
				const start = dayjs(pendingStart);
				const end = dayjs();
				const newScores = getUpdatedScores(data.scores, start, end);
				await memoryDoc.set({
					...GET_DEFAULT_MEMORY(),
					pendingStart: null,
					pendingEnd: null,
					scores: newScores,
				});
			}
			if (isActive) {
				await setPending();
			} else {
				await commitPending();
			}
		},
		[local.pendingStart, memoryDoc],
	);

	const normalizedScores = useMemo(() => {
		const max = Math.max(...local.scores);
		return local.scores.map((s) => s / max);
	}, [local.scores]);

	const bestHour = useMemo(() => getBestHour(local.scores), [local.scores]);
	const bestPeriod = useMemo(() => getPeriod(bestHour), [bestHour]);

	const resetHours = useCallback(() => {
		memoryDoc.update({
			pendingEnd: null,
			pendingStart: null,
			scores: [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			],
		});
	}, [memoryDoc]);

	const isReset = useMemo(
		() => local.scores.every((s) => s === 0),
		[local.scores],
	);

	const prevAnonMemory = useRef<BestHoursMemory>();
	useEffect(
		function savePrevAnonMemory() {
			return subscribeBeforeSignOutAnonymously(async (ev) => {
				const snapshot = await bestHoursMemoryCollection.doc(ev.uid).get();
				prevAnonMemory.current = snapshot.data();
				await bestHoursMemoryCollection.doc(ev.uid).delete();
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
				await bestHoursMemoryCollection
					.doc(ev.user.uid)
					.set(prevAnonMemory.current);
			});
		},
		[subscribeAfterSignInAnonymously],
	);

	return {
		normalizedScores,
		bestHour,
		bestPeriod,
		updateBestHoursOnActiveChange,
		resetHours,
		isReset,
	};
}
