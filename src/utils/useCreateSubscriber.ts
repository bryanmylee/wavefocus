import {useCallback, useRef} from 'react';

export type Subscriber<TData> = (data: TData) => void;
export type Unsubscriber = () => void;

export function useCreateSubscriber<TData>() {
	const subscribers = useRef<Subscriber<TData>[]>([]);
	const notify = useCallback((data: TData) => {
		subscribers.current.forEach((subscriber) => {
			subscriber(data);
		});
	}, []);
	const subscribe = useCallback((subscriber: Subscriber<TData>) => {
		subscribers.current.push(subscriber);
		return () => {
			const idx = subscribers.current.findIndex((s) => s === subscriber);
			if (idx !== -1) {
				subscribers.current.splice(idx, 1);
			}
		};
	}, []);
	return [notify, subscribe] as const;
}
