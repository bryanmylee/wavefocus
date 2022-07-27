import React, {PropsWithChildren} from 'react';
import {ThemeProvider as SCThemeProvider} from 'styled-components/native';
import {useTimerStage} from '../timer/TimerStageProvider';
import {LIGHT_FOCUS_THEME, LIGHT_RELAX_THEME} from './Theme';

export default function ThemeProvider({children}: PropsWithChildren) {
	const [timerStage] = useTimerStage();
	const theme = timerStage === 'focus' ? LIGHT_FOCUS_THEME : LIGHT_RELAX_THEME;
	return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}
