export interface TimerProps {
	seconds: number;
}

export default function Timer({seconds}: TimerProps) {
	const minutePart = Math.floor(seconds / 60);
	const secondPart = String(seconds % 60).padStart(2, '0');

	return (
		<div className="w-52 h-52 relative">
			<div className="absolute inset-0 flex justify-center items-center">
				<h1 className="text-3xl font-bold text-timer-text">
					{minutePart}:{secondPart}
				</h1>
			</div>
		</div>
	);
}
