import * as functions from 'firebase-functions';

type TimerStage = 'focus' | 'relax';

interface ScheduleNotificationPayload {
	secondsRemaining: number;
	timerStage: TimerStage;
}

export const scheduleNotification = functions.https.onCall(
	async (data: ScheduleNotificationPayload, {auth}) => {
		if (auth == null) {
			throw new Error('scheduleNotification: User not authenticated');
		}
		return {
			message: 'scheduled notification',
		};
	},
);

export const clearNotification = functions.https.onCall(async (_, {auth}) => {
	if (auth == null) {
		throw new Error('clearNotification: User not authenticated');
	}
	return {
		message: 'cleared notification',
	};
});
