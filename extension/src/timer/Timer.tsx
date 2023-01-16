import {useMemo} from 'react';
import {FOCUS_DURATION_SEC, RELAX_DURATION_SEC} from '../constants';
import {useTimerScreenDimensions} from './useTimerScreenDimensions';

export interface TimerProps {
	seconds: number;
	isFocus: boolean;
}

export default function Timer({seconds, isFocus}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');

	const duration = isFocus ? FOCUS_DURATION_SEC : RELAX_DURATION_SEC;
	const progress = Math.max(0, 1 - seconds / duration);

	const {width, height} = useTimerScreenDimensions();
	const size = Math.min(width, height);
	const diameter = size * 0.75;
	const strokeWidth = size * 0.036;
	const radius = diameter / 2 - strokeWidth;
	const paddedDiameter = diameter;
	const circumference = Math.PI * 2 * radius;

	const circleDashoffset = useMemo(
		() => circumference * (1 - progress),
		[progress, circumference],
	);

	return (
		<div
			className="flex-1 relative"
			style={{width: paddedDiameter, height: paddedDiameter}}>
			<div className="absolute inset-0">
				<svg className="w-full h-full -rotate-90">
					<circle
						cx={paddedDiameter / 2}
						cy={paddedDiameter / 2}
						r={radius}
						strokeWidth={strokeWidth}
						fill="transparent"
						stroke="var(--color-timer-prog-track)"
						opacity="var(--opacity-timer-prog-track)"
					/>
					<circle
						cx={paddedDiameter / 2}
						cy={paddedDiameter / 2}
						r={radius}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						fill="transparent"
						stroke="var(--color-timer-prog-fill)"
						strokeDasharray={circumference}
						strokeDashoffset={circleDashoffset}
					/>
				</svg>
			</div>
			<div className="absolute inset-0 flex justify-center items-center">
				<h1 className="text-3xl font-bold text-timer-text transition-colors">
					{minutePart}:{secondPart}
				</h1>
			</div>
		</div>
	);
}
