export interface Theme {
	background: string;
	timer: {
		text: string;
		progressFill: string;
		progressTrack: string;
		progressTrackOpacity: number;
		fluidFill: string;
		fluidOpacity: number;
	};
	fill: {
		primary: string;
	};
	text: {
		base: string;
		subtitle: string;
	};
}

export const LIGHT_FOCUS_THEME: Theme = {
	background: 'rgb(226, 255, 250)',
	timer: {
		text: 'rgb(7, 115, 95)',
		progressFill: 'rgb(7, 115, 95)',
		progressTrack: 'rgb(186, 235, 225)',
		progressTrackOpacity: 0.6,
		fluidFill: 'rgb(24, 197, 166)',
		fluidOpacity: 0.3,
	},
	fill: {
		primary: 'rgb(7, 115, 95)',
	},
	text: {
		base: 'rgb(6, 67, 56)',
		subtitle: 'rgb(98, 151, 141)',
	},
};

export const LIGHT_RELAX_THEME: Theme = {
	background: 'rgb(226, 250, 255)',
	timer: {
		text: 'rgb(42, 107, 123)',
		progressFill: 'rgb(42, 107, 123)',
		progressTrack: 'rgb(43, 85, 95)',
		progressTrackOpacity: 0.12,
		fluidFill: 'rgb(0, 113, 138)',
		fluidOpacity: 0.12,
	},
	fill: {
		primary: 'rgb(42, 107, 123)',
	},
	text: {
		base: 'rgb(6, 67, 56)',
		subtitle: 'rgb(98, 151, 141)',
	},
};

export const DARK_FOCUS_THEME: Theme = {
	background: 'rgb(33, 38, 37)',
	timer: {
		text: 'rgb(129, 254, 231)',
		progressFill: 'rgb(129, 254, 231)',
		progressTrack: 'rgb(24, 73, 63)',
		progressTrackOpacity: 1.0,
		fluidFill: 'rgb(24, 197, 166)',
		fluidOpacity: 0.3,
	},
	fill: {
		primary: 'rgb(129, 254, 231)',
	},
	text: {
		base: 'rgb(6, 67, 56)',
		subtitle: 'rgb(98, 151, 141)',
	},
};

export const DARK_RELAX_THEME: Theme = {
	background: 'rgb(33, 37, 38)',
	timer: {
		text: 'rgb(158, 237, 255)',
		progressFill: 'rgb(158, 237, 255)',
		progressTrack: 'rgb(60, 87, 93)',
		progressTrackOpacity: 0.5,
		fluidFill: 'rgb(133, 212, 229)',
		fluidOpacity: 0.12,
	},
	fill: {
		primary: 'rgb(158, 237, 255)',
	},
	text: {
		base: 'rgb(6, 67, 56)',
		subtitle: 'rgb(98, 151, 141)',
	},
};
