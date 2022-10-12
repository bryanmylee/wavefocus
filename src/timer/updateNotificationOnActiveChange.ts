import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {TimerStage} from './types';

interface OnActiveChangePayload {
	isActive: boolean;
	timerStage: TimerStage;
	secondsRemaining: number;
	user: FirebaseAuthTypes.User;
}

export function updateNotificationOnActiveChange(
	payload: OnActiveChangePayload,
) {
	if (payload.isActive) {
		scheduleNotification(payload);
	} else {
		clearNotification(payload);
	}
}

function scheduleNotification(payload: OnActiveChangePayload) {
	const now = Date.now();
}

function clearNotification(payload: OnActiveChangePayload) {}
