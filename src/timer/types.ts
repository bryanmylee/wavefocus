export interface TTimerMemory {
	isFocus: boolean;
	start: number | null;
	pause: number | null;
}

export type TTimerStage = 'focus' | 'relax';
