import {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'viewed_login';

async function hasViewedLoginScreenBefore() {
	try {
		const value = await AsyncStorage.getItem(KEY);
		return value != null;
	} catch (e) {
		return false;
	}
}

async function setViewedLoginScreenBefore() {
	await AsyncStorage.setItem(KEY, 'true');
}

export function useShowLoginPrompt() {
	const [viewed, setViewed] = useState(true);
	useEffect(function readInitial() {
		hasViewedLoginScreenBefore().then((v) => {
			setViewed(v);
		});
	}, []);

	const [show, setShow] = useState(false);

	const request = useCallback(() => {
		setShow(true);
	}, []);

	const acknowledge = useCallback(async () => {
		setShow(false);
		setViewedLoginScreenBefore();
	}, []);

	return [show && !viewed, request, acknowledge] as const;
}
