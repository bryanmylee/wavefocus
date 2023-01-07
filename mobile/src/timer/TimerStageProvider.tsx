import React, {
	createContext,
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useContext,
	useState,
} from 'react';

export type TimerStageContext = [
	isFocus: boolean,
	setIsFocus: Dispatch<SetStateAction<boolean>>,
];

const TimerStageContext = createContext<TimerStageContext>([true, (s) => s]);

export const useTimerStage = () => useContext(TimerStageContext);

export default function TimerStageProvider({children}: PropsWithChildren) {
	const [isFocus, setIsFocus] = useState(true);
	return (
		<TimerStageContext.Provider value={[isFocus, setIsFocus]}>
			{children}
		</TimerStageContext.Provider>
	);
}
