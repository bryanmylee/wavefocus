import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import {useUser} from '../auth/UserProvider';
import {Review, REVIEW_TO_WEIGHT} from '../review/Review';
import {BestHoursMemory, Period} from './types';
import {useHistoryMemory} from './useHistoryMemory';

const bestHoursMemoryCollection =
	firestore().collection<BestHoursMemory>('best-hours');

const GET_DEFAULT_MEMORY = (): BestHoursMemory => ({
	pendingReview: 'okay',
	scores: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	],
});

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

export function useBestHoursMemory() {
	const {user} = useUser();
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

	const pendingReview = local.pendingReview;
	const setPendingReview = useCallback(
		async (review: Review) => {
			const snapshot = await memoryDoc.get();
			if (snapshot.exists) {
				memoryDoc.update({pendingReview: review});
			} else {
				memoryDoc.set({...GET_DEFAULT_MEMORY(), pendingReview: review});
			}
		},
		[memoryDoc],
	);

	const {intervals} = useHistoryMemory();
	const latestInterval = intervals.at(-1);
	const prevLatestInterval = useRef(
		local.pendingStart != null && local.pendingEnd != null
			? {start: local.pendingStart, end: local.pendingEnd}
			: undefined,
	);
	useEffect(
		function updateBestHours() {
			async function commitPending() {
				const pendingEnd = local.pendingEnd;
				const pendingStart = local.pendingStart;
				const pendingWeight = REVIEW_TO_WEIGHT[local.pendingReview];
				if (pendingStart == null || pendingEnd == null) {
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
				const scores = data.scores;
				const start = dayjs(pendingStart);
				const end = dayjs(pendingEnd);
				// Account for durations that span across two separate hour buckets.
				if (start.hour() === end.hour()) {
					scores[start.hour()] += getMinsBetween(start, end) * pendingWeight;
				} else {
					const between = start.endOf('hour');
					scores[start.hour()] +=
						getMinsBetween(start, between) * pendingWeight;
					scores[end.hour()] += getMinsBetween(between, end) * pendingWeight;
				}

				await memoryDoc.set({
					...GET_DEFAULT_MEMORY(),
					pendingStart: latestInterval?.start,
					pendingEnd: latestInterval?.end,
					scores,
				});
			}
			async function updatePending() {
				const snapshot = await memoryDoc.get();
				if (snapshot.exists) {
					await memoryDoc.update({
						pendingStart: latestInterval?.start,
						pendingEnd: latestInterval?.end,
					});
				} else {
					await memoryDoc.set({
						...GET_DEFAULT_MEMORY(),
						pendingStart: latestInterval?.start,
						pendingEnd: latestInterval?.end,
					});
				}
			}
			async function updatePendingInterval() {
				if (latestInterval == null) {
					return;
				}
				const {start, end} = latestInterval;
				if (start == null || end == null) {
					return;
				}
				if (
					start === prevLatestInterval.current?.start &&
					end === prevLatestInterval.current?.end
				) {
					return;
				}
				prevLatestInterval.current = latestInterval;

				const now = Date.now();
				// If the latest interval end is in the future, then the timer is being
				// started.
				if (end > now) {
					// When the timer is started, commit pending weight changes.
					await commitPending();
				} else {
					// When the timer is paused, update the pending interval.
					await updatePending();
				}
			}
			updatePendingInterval();
		},
		[
			latestInterval,
			memoryDoc,
			local.pendingReview,
			local.pendingStart,
			local.pendingEnd,
		],
	);

	const normalizedScores = useMemo(() => {
		const max = Math.max(...local.scores);
		return local.scores.map((s) => s / max);
	}, [local.scores]);

	const bestHour = useMemo(() => getBestHour(local.scores), [local.scores]);
	const bestPeriod = useMemo(() => getPeriod(bestHour), [bestHour]);

	const resetHours = useCallback(() => {
		memoryDoc.update({
			scores: [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			],
		});
	}, [memoryDoc]);

	return {
		pendingReview,
		setPendingReview,
		normalizedScores,
		bestHour,
		bestPeriod,
		resetHours,
	};
}
