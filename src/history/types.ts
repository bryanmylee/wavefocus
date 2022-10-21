import {Review} from '../review/Review';

export type HistoryMemory = Record<string, number>;

export interface BestHoursMemory {
	pendingStart?: number;
	pendingEnd?: number;
	pendingReview: Review;
	scores: number[];
}
