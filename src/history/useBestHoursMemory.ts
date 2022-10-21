import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import {useUser} from '../auth/UserProvider';
import {Review, REVIEW_TO_WEIGHT} from '../review/Review';
import {BestHoursMemory} from './types';
import {useHistoryMemory} from './useHistoryMemory';

const bestHoursMemoryCollection =
	firestore().collection<BestHoursMemory>('best-hours');

const GET_DEFAULT_MEMORY = (): BestHoursMemory => ({
	pendingReview: 'okay',
	scores: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	],
});

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
				const hour = dayjs(pendingEnd).hour();
				const durationMin = (pendingEnd - pendingStart) / 1000 / 60;
				const snapshot = await memoryDoc.get();
				if (!snapshot.exists) {
					return;
				}
				const data = snapshot.data();
				if (data == null) {
					return;
				}
				const scores = data.scores;
				scores[hour] += durationMin * pendingWeight;
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

	return {
		pendingReview,
		setPendingReview,
	};
}
