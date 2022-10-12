import functions from '@react-native-firebase/functions';
import {TimerStage} from './types';

interface UpdateNotificationProps {
	isActive: boolean;
	timerStage: TimerStage;
	secondsRemaining: number;
}

export function updateNotification(props: UpdateNotificationProps) {
	if (props.isActive) {
		scheduleNotification(props);
	} else {
		clearNotification();
	}
}

interface ScheduleNotificationPayload {
	secondsRemaining: number;
	timerStage: TimerStage;
}

async function scheduleNotification(props: UpdateNotificationProps) {
	const payload: ScheduleNotificationPayload = {
		secondsRemaining: props.secondsRemaining,
		timerStage: props.timerStage,
	};
	const response = await functions().httpsCallable('scheduleNotification')(
		payload,
	);
	console.log('scheduleNotification: received response', response);
}

async function clearNotification() {
	const response = await functions().httpsCallable('clearNotification')();
	console.log('clearNotification: received response', response);
}
