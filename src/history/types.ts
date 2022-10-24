export type HistoryMemory = {
	/**
	 * Avoid arbitrary data as fields on the document to reduce unnecessary index
	 * fields.
	 * https://firebase.google.com/docs/firestore/solutions/index-map-field
	 */
	history: Record<string, number>;
};

export interface BestHoursMemory {
	pendingStart: number | null;
	pendingEnd: number | null;
	scores: number[];
}

export type Period =
	| 'early-morning'
	| 'morning'
	| 'noon'
	| 'afternoon'
	| 'evening'
	| 'night'
	| 'late-night';

export interface Interval {
	start: number;
	end: number;
}
