import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useShowPrompt(key: string) {
	const [viewed, setViewed] = useState(true);
	useEffect(
		function readInitial() {
			async function checkInitial() {
				try {
					const value = await AsyncStorage.getItem(key);
					setViewed(value != null);
				} catch (e) {
					setViewed(true);
				}
			}
			checkInitial();
		},
		[key],
	);

	const [show, setShow] = useState(false);

	const request = useCallback(() => {
		setShow(true);
	}, []);

	const acknowledge = useCallback(async () => {
		setShow(false);
		setViewed(true);
		AsyncStorage.setItem(key, 'true');
	}, [key]);

	return [show && !viewed, request, acknowledge] as const;
}
