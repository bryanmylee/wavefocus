import clsx from 'classnames';
import classes from './ActiveFocusAnimation.module.css';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

interface ActiveFocusAnimationProps {
	show: boolean;
	pause?: boolean;
}

export default function ActiveFocusAnimation({
	show,
}: ActiveFocusAnimationProps) {
	const {width, height} = useTimerScreenDimensions();
	const size = Math.min(width, height);
	const diameter = size * 0.75 + 15;
	const radius = diameter / 2;
	return (
		<>
			<FocusCircle radius={radius} cycleMs={1000} show={show} />
			<FocusCircle radius={radius} cycleMs={1333} show={show} />
			<FocusCircle radius={radius} cycleMs={1750} show={show} />
		</>
	);
}

interface FocusCircleProps {
	radius: number;
	cycleMs: number;
	show: boolean;
}

function FocusCircle({radius, cycleMs, show}: FocusCircleProps) {
	const {width, height} = useTimerScreenDimensions();
	const cx = width / 2;
	const cy = height / 2;
	const wiggle = 5;
	return (
		<circle
			fill="hsl(var(--color-timer-fluid-fill) / var(--opacity-timer-fluid))"
			r={radius}
			cx={cx}
			cy={cy - wiggle}
			className={clsx(
				classes.circle__wiggle,
				'transition-opacity duration-500',
				!show && 'opacity-0',
			)}
			style={
				{
					transformOrigin: `${cx}px ${cy}px`,
					'--cycleMs': `${cycleMs * 3}ms`,
				} as any
			}
		/>
	);
}
