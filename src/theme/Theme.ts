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
}

export const LIGHT_FOCUS_THEME: Theme = {
	background: 'rgb(226, 255, 250)',
	timer: {
		text: 'rgb(0, 79, 64)',
		progressFill: 'rgb(7, 115, 95)',
		progressTrack: 'rgb(226,  255, 250)',
		progressTrackOpacity: 0.5,
		fluidFill: 'rgb(24, 197, 166)',
		fluidOpacity: 0.3,
	},
	fill: {
		primary: 'rgb(0, 79, 64)',
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
};
