import {useThemeBodyClassList} from './theme/useThemeBodyClassList';

export default function App() {
	useThemeBodyClassList();
	return (
		<div className="w-80 h-96 bg-background">
			<h1 className="text-text-base">Wave Focus</h1>
		</div>
	);
}
