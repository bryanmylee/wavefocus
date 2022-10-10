import React, {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState,
} from 'react';
import {TimerStage} from './types';

export type TTimerStageContext = [
	timerStage: TimerStage,
	setTimerStage: Dispatch<SetStateAction<TimerStage>>,
];

const TimerStageContext = createContext<TTimerStageContext>([
	'focus',
	(s) => s,
]);

export const useTimerStage = () => useContext(TimerStageContext);

export default function TimerStageProvider({children}: PropsWithChildren) {
	const [timerStage, setTimerStage] = useState<TimerStage>('focus');
	return (
		<TimerStageContext.Provider value={[timerStage, setTimerStage]}>
			{children}
		</TimerStageContext.Provider>
	);
}
