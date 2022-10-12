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

interface TimerNotificationMemory {
	name: string;
}

interface DeviceMemory {
	tokens: string[];
}

interface NotificationPayload {
	userId: string;
	isFocus: boolean;
}

export const onTimerUpdate = functions.firestore
	.document('/timers/{userId}')
	.onWrite(async (change, context) => {
		const {userId} = context.params;
		const beforeSnapshot =
			change.before as FirebaseFirestore.DocumentSnapshot<TimerMemory>;
		const beforeData = beforeSnapshot.data();
		const afterSnapshot =
			change.after as FirebaseFirestore.DocumentSnapshot<TimerMemory>;
		const afterData = afterSnapshot.data();
		if (beforeData == null) {
			// User created. No notifications needed.
			return;
		}
		if (afterData == null) {
			// User deleted. Clear the notification.
			await cancelTimerNotification(userId);
			return;
		}
		if (afterData.pause != null && beforeData.pause == null) {
			// Timer paused. Clear the notification.
			await cancelTimerNotification(userId);
			return;
		}
		if (afterData.start != null) {
			// Timer started. Schedule the notification.
			await scheduleTimerNotification({
				isFocus: afterData.isFocus,
				startMs: afterData.start,
				userId,
			});
			return;
		}
	});

async function cancelTimerNotification(userId: string) {
	console.log('cancelTimerNotification:', userId);
	const tasksClient = new CloudTasksClient();
	const ref = admin
		.firestore()
		.doc(
			`timer-notifications/${userId}`,
		) as FirebaseFirestore.DocumentReference<TimerNotificationMemory>;
	const snapshot = await ref.get();
	const data = snapshot.data();
	if (data == null) {
		console.warn(
			'cancelTimerNotification: Timer notification name not found in Firestore',
		);
		return;
	}
	try {
		await tasksClient.deleteTask({name: data.name});
		console.log('cancelTimerNotification: Cancelled task', data.name);
	} catch (err) {
		console.warn('cancelTimerNotification: Failed to delete task');
	}
	await admin.firestore().doc(`timer-notifications/${userId}`).delete();
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
	// Setting a task name explicitly enables task deduplication, which rate
	// limits the creation of tasks with the same name to 1 per hour.
	//
	// Instead, save the randomly generated task name to Firestore then read it
	// when cancelling a user's request.
	const [task] = await tasksClient.createTask({
		parent: queuePath,
		task: {
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
	if (task.name != null) {
		console.log('scheduleTimerNotification: Scheduled task', task.name);
		await admin
			.firestore()
			.doc(`timer-notifications/${userId}`)
			.set({name: task.name});
	}
}

type Notification = {
	title: string;
	body: string;
};

const FOCUS_END_NOTIFICATION: Notification = {
	title: 'Focus over!',
	body: 'Take a five minute break.',
};

const RELAX_END_NOTIFICATION: Notification = {
	title: 'Ready to focus again?',
	body: 'Get 25 minutes of uninterrupted work done.',
};

export const sendNotification = functions.https.onRequest(async (req, res) => {
	const payload = req.body as NotificationPayload;
	console.log('sendNotification:', payload);
	const ref = admin
		.firestore()
		.doc(
			`devices/${payload.userId}`,
		) as FirebaseFirestore.DocumentReference<DeviceMemory>;
	const snapshot = await ref.get();
	const data = snapshot.data();
	if (data == null) {
		console.warn('sendNotification: No devices found for user', payload.userId);
		return;
	}
	const tokens = data.tokens ?? [];
	admin.messaging().sendMulticast({
		tokens,
		notification: payload.isFocus
			? FOCUS_END_NOTIFICATION
			: RELAX_END_NOTIFICATION,
		fcmOptions: {
			analyticsLabel: payload.isFocus ? 'focus_end' : 'relax_end',
		},
	});
	res.sendStatus(200);
});
