export interface TTheme {
	background: string;
	timer: {
		text: string;
		progressFill: string;
		progressTrack: string;
	};
	fill: {
		primary: string;
	};
}

export const LIGHT_FOCUS_THEME: TTheme = {
	background: 'rgb(226, 255, 250)',
	timer: {
		text: 'rgb(0, 79, 64)',
		progressFill: 'rgb(7, 115, 95)',
		progressTrack: 'rgba(226,  255, 250, 50%)',
	},
	fill: {
		primary: 'rgb(0, 79, 64)',
	},
};

export const LIGHT_RELAX_THEME: TTheme = {
	background: 'rgb(226, 250, 255)',
	timer: {
		text: 'rgb(42, 107, 123)',
		progressFill: 'rgb(42, 107, 123)',
		progressTrack: 'rgba(43, 85, 95, 12%)',
	},
	fill: {
		primary: 'rgb(42, 107, 123)',
	},
};
