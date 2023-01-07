export const clamp = (value: number, min: number, max: number) => {
	return Math.max(Math.min(value, max), min);
};

export const clampWorklet = (value: number, min: number, max: number) => {
	'worklet';
	return Math.max(Math.min(value, max), min);
};
