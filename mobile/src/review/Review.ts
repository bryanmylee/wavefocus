export const REVIEWS = ['bad', 'okay', 'good'] as const;
export type Review = typeof REVIEWS[number];
export const REVIEW_TO_LABEL: Record<Review, string> = {
	bad: 'Bad',
	okay: 'Okay',
	good: 'Good',
};

export const REVIEW_TO_WEIGHT: Record<Review, number> = {
	bad: 0.5,
	okay: 1,
	good: 1.5,
};
