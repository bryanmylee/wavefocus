import ActiveFocusAnimation from './ActiveFocusAnimation';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

interface TimerFluidAnimationProps {
	isActive: boolean;
	isFocus: boolean;
	pause?: boolean;
}

export default function TimerFluidAnimation({
	isActive,
	isFocus,
	pause,
}: TimerFluidAnimationProps) {
	const {width, height} = useTimerScreenDimensions();
	return (
		<div className="flex-1">
			<svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
				<ActiveFocusAnimation show={isFocus && isActive} pause={pause} />
			</svg>
		</div>
	);
}
