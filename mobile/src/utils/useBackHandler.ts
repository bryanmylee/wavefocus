import {DependencyList, useCallback, useEffect} from 'react';
import {BackHandler} from 'react-native';

export const useBackHandler = (
	callback: () => boolean,
	deps: DependencyList,
) => {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const savedCallback = useCallback(callback, deps);
	useEffect(() => {
		const listener = BackHandler.addEventListener(
			'hardwareBackPress',
			savedCallback,
		);
		return listener.remove;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
};
