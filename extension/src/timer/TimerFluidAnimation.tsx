import ActiveFocusAnimation from './ActiveFocusAnimation';
import WavesAnimation from './WavesAnimation';
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
				<WavesAnimation
					show={!isFocus || !isActive}
					move={!isFocus}
					pause={pause}
					baseHeight={90}
				/>
				<ActiveFocusAnimation show={isFocus && isActive} pause={pause} />
			</svg>
		</div>
	);
}
