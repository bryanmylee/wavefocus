import {Review} from '../review/Review';

export type HistoryMemory = {
	/**
	 * Avoid arbitrary data as fields on the document to reduce unnecessary index
	 * fields.
	 * https://firebase.google.com/docs/firestore/solutions/index-map-field
	 */
	history: Record<string, number>;
};

export interface BestHoursMemory {
	pendingStart?: number;
	pendingEnd?: number;
	pendingReview: Review;
	scores: number[];
}
