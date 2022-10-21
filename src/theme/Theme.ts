export interface Theme {
	background: string;
	primary: string;
	timer: {
		text: string;
		progressFill: string;
		progressTrack: string;
		progressTrackOpacity: number;
		fluidFill: string;
		fluidOpacity: number;
	};
	button: {
		fill: string;
		text: string;
	};
	text: {
		base: string;
		subtitle: string;
	};
	select: {
		fill: string;
		text: string;
		activeFill: string;
		activeText: string;
	};
}

export const LIGHT_FOCUS_THEME: Theme = {
	background: 'hsl(170, 100%, 94%)',
	primary: 'hsl(170, 89%, 24%)',
	timer: {
		text: 'hsl(170, 89%, 24%)',
		progressFill: 'hsl(170, 89%, 24%)',
		progressTrack: 'hsl(170, 55%, 83%)',
		progressTrackOpacity: 0.5,
		fluidFill: 'hsl(170, 78%, 43%)',
		fluidOpacity: 0.3,
	},
	button: {
		fill: 'hsl(170, 68%, 81%)',
		text: 'hsl(170, 84%, 14%)',
	},
	text: {
		base: 'hsl(170, 84%, 14%)',
		subtitle: 'hsl(170, 21%, 49%)',
	},
	select: {
		fill: 'hsl(170, 68%, 81%)',
		text: 'hsl(170, 20%, 45%)',
		activeFill: 'hsl(170, 100%, 94%)',
		activeText: 'hsl(170, 84%, 14%)',
	},
};

export const LIGHT_RELAX_THEME: Theme = {
	background: 'hsl(190, 100%, 94%)',
	primary: 'hsl(190, 89%, 24%)',
	timer: {
		text: 'hsl(190, 49%, 32%)',
		progressFill: 'hsl(190, 49%, 32%)',
		progressTrack: 'hsl(190, 38%, 27%)',
		progressTrackOpacity: 0.12,
		fluidFill: 'hsl(190, 100%, 27%)',
		fluidOpacity: 0.12,
	},
	button: {
		fill: 'hsl(190, 69%, 81%)',
		text: 'hsl(190, 84%, 14%)',
	},
	text: {
		base: 'hsl(190, 84%, 14%)',
		subtitle: 'hsl(190, 21%, 49%)',
	},
	select: {
		fill: 'hsl(190, 60%, 86%)',
		text: 'hsl(190, 20%, 40%)',
		activeFill: 'hsl(190, 100%, 94%)',
		activeText: 'hsl(190, 84%, 14%)',
	},
};

export const DARK_FOCUS_THEME: Theme = {
	background: 'hsl(170, 7%, 14%)',
	primary: 'hsl(170, 98%, 75%)',
	timer: {
		text: 'hsl(170, 98%, 75%)',
		progressFill: 'hsl(170, 98%, 75%)',
		progressTrack: 'hsl(170, 50%, 19%)',
		progressTrackOpacity: 1.0,
		fluidFill: 'hsl(170, 78%, 43%)',
		fluidOpacity: 0.3,
	},
	button: {
		fill: 'hsl(170, 98%, 75%)',
		text: 'hsl(170, 84%, 14%)',
	},
	text: {
		base: 'hsl(170, 72%, 82%)',
		subtitle: 'hsl(170, 21%, 60%)',
	},
	select: {
		fill: 'hsl(170, 48%, 23%)',
		text: 'hsl(170, 40%, 70%)',
		activeFill: 'hsl(170, 100%, 94%)',
		activeText: 'hsl(170, 84%, 14%)',
	},
};

export const DARK_RELAX_THEME: Theme = {
	background: 'hsl(190, 7%, 14%)',
	primary: 'hsl(190, 98%, 75%)',
	timer: {
		text: 'hsl(190, 98%, 75%)',
		progressFill: 'hsl(190, 98%, 75%)',
		progressTrack: 'hsl(190, 50%, 19%)',
		progressTrackOpacity: 0.5,
		fluidFill: 'hsl(190, 78%, 63%)',
		fluidOpacity: 0.12,
	},
	button: {
		fill: 'hsl(190, 98%, 75%)',
		text: 'hsl(190, 84%, 14%)',
	},
	text: {
		base: 'hsl(190, 72%, 82%)',
		subtitle: 'hsl(190, 21%, 60%)',
	},
	select: {
		fill: 'hsl(190, 15%, 21%)',
		text: 'hsl(190, 20%, 60%)',
		activeFill: 'hsl(190, 100%, 94%)',
		activeText: 'hsl(190, 84%, 14%)',
	},
};
