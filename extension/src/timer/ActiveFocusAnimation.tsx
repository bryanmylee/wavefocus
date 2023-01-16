import classes from './ActiveFocusAnimation.module.css';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

interface ActiveFocusAnimationProps {
	show: boolean;
	pause?: boolean;
}

export default function ActiveFocusAnimation({
	show,
	pause,
}: ActiveFocusAnimationProps) {
	const {width, height} = useTimerScreenDimensions();
	const size = Math.min(width, height);
	const diameter = size * 0.75 + 15;
	const radius = diameter / 2;
	return (
		<>
			<FocusCircle radius={radius} cycleMs={1000} pause={pause} />
			<FocusCircle radius={radius} cycleMs={1333} pause={pause} />
			<FocusCircle radius={radius} cycleMs={1750} pause={pause} />
		</>
	);
}

interface FocusCircleProps {
	radius: number;
	cycleMs: number;
	pause?: boolean;
}

function FocusCircle({radius, cycleMs, pause}: FocusCircleProps) {
	const {width, height} = useTimerScreenDimensions();
	const cx = width / 2;
	const cy = height / 2;
	const wiggle = 5;
	return (
		<circle
			fill="var(--color-timer-fluid-fill)"
			opacity="var(--opacity-timer-fluid)"
			r={radius}
			cx={cx}
			cy={cy - wiggle}
			className={classes.wiggle}
			style={
				{
					transformOrigin: `${cx}px ${cy}px`,
					'--cycleMs': `${cycleMs * 3}ms`,
				} as any
			}
		/>
	);
}
