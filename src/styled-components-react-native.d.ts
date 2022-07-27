import 'styled-components/native';
import {TTheme} from './theme/Theme';

declare module 'styled-components/native' {
	export interface DefaultTheme extends TTheme {}
}
