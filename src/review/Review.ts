export const REVIEWS = ['Bad', 'Okay', 'Good'] as const;
export type Review = typeof REVIEWS[number];
