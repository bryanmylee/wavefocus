import {CloudTasksClient} from '@google-cloud/tasks';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const PROJECT_ID = JSON.parse(process.env.FIREBASE_CONFIG!).projectId;
const LOCATION = 'us-central1';
const QUEUE_NAME = 'wavefocus-notifications';
const SEND_NOTIFICATION_URL = `https://${LOCATION}-${PROJECT_ID}.cloudfunctions.net/sendNotification`;

const FOCUS_DURATION_SEC = 25 * 60;
const RELAX_DURATION_SEC = 5 * 60;

interface TimerMemory {
	isFocus: boolean;
	start: number | null;
	pause: number | null;
}

interface NotificationPayload {
	userId: string;
	isFocus: boolean;
}

export const onTimerUpdate = functions.firestore
	.document('/timers/{userId}')
	.onWrite(async (change, context) => {
		const {userId} = context.params;
		const snapshot =
			change.after as FirebaseFirestore.DocumentSnapshot<TimerMemory>;
		const data = snapshot.data();
		if (data == null) {
			// User deleted. Clear the notification.
			await cancelTimerNotification(userId);
			return;
		}
		if (data.pause != null || data.start == null) {
			// Timer paused. Clear the notification.
			await cancelTimerNotification(userId);
			return;
		}
		// Timer started. Schedule the notification.
		await scheduleTimerNotification({
			isFocus: data.isFocus,
			startMs: data.start,
			userId,
		});
	});

const timerNotificationTaskName = (userId: string) => `timer_end_${userId}`;

async function cancelTimerNotification(userId: string) {
	console.log('cancelTimerNotification:', userId);
	const tasksClient = new CloudTasksClient();
	const taskName = tasksClient.taskPath(
		PROJECT_ID,
		LOCATION,
		QUEUE_NAME,
		timerNotificationTaskName(userId),
	);
	await tasksClient.deleteTask({name: taskName});
}

interface ScheduleNotificationProps {
	isFocus: boolean;
	startMs: number;
	userId: string;
}

async function scheduleTimerNotification({
	isFocus,
	startMs,
	userId,
}: ScheduleNotificationProps) {
	console.log('scheduleTimerNotification:', {userId, isFocus, startMs});
	const durationSec = isFocus ? FOCUS_DURATION_SEC : RELAX_DURATION_SEC;
	const endSec = Math.floor(startMs / 1000) + durationSec;

	const payload: NotificationPayload = {
		isFocus: isFocus,
		userId: userId,
	};

	const tasksClient = new CloudTasksClient();
	const queuePath = tasksClient.queuePath(PROJECT_ID, LOCATION, QUEUE_NAME);
	const taskName = tasksClient.taskPath(
		PROJECT_ID,
		LOCATION,
		QUEUE_NAME,
		timerNotificationTaskName(userId),
	);

	await tasksClient.createTask({
		parent: queuePath,
		task: {
			name: taskName,
			scheduleTime: {
				seconds: endSec,
			},
			httpRequest: {
				httpMethod: 'POST',
				url: SEND_NOTIFICATION_URL,
				body: Buffer.from(JSON.stringify(payload)).toString('base64'),
				headers: {
					'Content-Type': 'application/json',
				},
			},
		},
	});
}

export const sendNotification = functions.https.onRequest(async (req, res) => {
	const payload = req.body as NotificationPayload;
	console.log('sendNotification:', payload);
	res.send(200);
});
