import React, {PropsWithChildren, useContext, useRef} from 'react';

type SimultaneousGestures = Record<string, React.MutableRefObject<unknown>>;

const SimultaneousGesturesContext = React.createContext<SimultaneousGestures>(
	{},
);

export function SimultaneousGesturesProvider({children}: PropsWithChildren) {
	const gestures = useRef<SimultaneousGestures>({});
	return (
		<SimultaneousGesturesContext.Provider value={gestures.current}>
			{children}
		</SimultaneousGesturesContext.Provider>
	);
}

export function useSimultaneousGestures<THandler>(id: string) {
	const gestures = useContext(SimultaneousGesturesContext);
	const gestureRef = useRef<THandler | null>(null);
	gestures[id] = gestureRef;
	const otherGestures = Object.entries(gestures)
		.filter(([key]) => key !== id)
		.map(([, value]) => value);
	return [gestureRef, otherGestures] as const;
}
