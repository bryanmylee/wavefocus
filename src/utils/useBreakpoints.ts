import {useWindowDimensions} from 'react-native';

export function useBreakpoints() {
	const window = useWindowDimensions();
	const md = window.width > 480;
	return {
		md,
	};
}
