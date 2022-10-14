import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'viewed_login';

export function useShowLoginPrompt() {
	const [viewed, setViewed] = useState(true);
	useEffect(function readInitial() {
		async function checkInitial() {
			try {
				const value = await AsyncStorage.getItem(KEY);
				setViewed(value != null);
			} catch (e) {
				setViewed(true);
			}
		}
		checkInitial();
	}, []);

	const [show, setShow] = useState(false);

	const request = useCallback(() => {
		setShow(true);
	}, []);

	const acknowledge = useCallback(async () => {
		setShow(false);
		setViewed(true);
		AsyncStorage.setItem(KEY, 'true');
	}, []);

	return [show && !viewed, request, acknowledge] as const;
}
