export interface TTheme {
	background: string;
	timer: {
		text: string;
		progressFill: string;
		progressTrack: string;
	};
	action: {
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
	action: {
		primary: 'rgb(0, 79, 64)',
	},
};

export const LIGHT_RELAX_THEME: TTheme = {
	background: 'rgb(226, 250, 255)',
	timer: {
		text: 'rgb(106, 142, 150)',
		progressFill: 'rgb(106, 142, 150)',
		progressTrack: 'rgba(43, 85, 95, 12%)',
	},
	action: {
		primary: 'rgb(33, 69, 78)',
	},
};
