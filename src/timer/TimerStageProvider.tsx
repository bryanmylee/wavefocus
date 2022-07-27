import React, {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState,
} from 'react';
import {TTimerStage} from './types';

export type TTimerStageContext = [
	timerStage: TTimerStage,
	setTimerStage: Dispatch<SetStateAction<TTimerStage>>,
];

const TimerStageContext = createContext<TTimerStageContext>([
	'focus',
	(s) => s,
]);

export const useTimerStage = () => useContext(TimerStageContext);

export default function TimerStageProvider({children}: PropsWithChildren) {
	const [timerStage, setTimerStage] = useState<TTimerStage>('focus');
	return (
		<TimerStageContext.Provider value={[timerStage, setTimerStage]}>
			{children}
		</TimerStageContext.Provider>
	);
}
