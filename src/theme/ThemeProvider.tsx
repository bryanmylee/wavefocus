import React, {PropsWithChildren} from 'react';
import {useColorScheme} from 'react-native';
import {ThemeProvider as SCThemeProvider} from 'styled-components/native';
import {useTimerStage} from '../timer/TimerStageProvider';
import {
	LIGHT_FOCUS_THEME,
	LIGHT_RELAX_THEME,
	DARK_FOCUS_THEME,
	DARK_RELAX_THEME,
} from './Theme';

export default function ThemeProvider({children}: PropsWithChildren) {
	const [isFocus] = useTimerStage();
	const colorScheme = useColorScheme();
	const theme =
		colorScheme !== 'dark'
			? isFocus
				? LIGHT_FOCUS_THEME
				: LIGHT_RELAX_THEME
			: isFocus
			? DARK_FOCUS_THEME
			: DARK_RELAX_THEME;

	return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}
