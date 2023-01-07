import 'styled-components/native';
import {Theme} from './theme/Theme';

declare module 'styled-components/native' {
	export interface DefaultTheme extends Theme {}
}
