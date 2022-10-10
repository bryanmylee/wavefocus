export interface TimerMemory {
	isFocus: boolean;
	start: number | null;
	pause: number | null;
}

export type TimerStage = 'focus' | 'relax';
