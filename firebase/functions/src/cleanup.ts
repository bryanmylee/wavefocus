import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import pLimit from './p-limit';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const COLLECTION_IDS = [
	'devices',
	'history',
	'timer-notifications',
	'timers',
	'last-active',
];
const limit = pLimit(3);

interface LastActiveMemory {
	timestamp: number;
}

async function cleanupUser(
	doc: FirebaseFirestore.DocumentReference<LastActiveMemory>,
) {
	const snapshot = await doc.get();
	if (!snapshot.exists) {
		return;
	}
	const data = snapshot.data();
	if (data == null) {
		return;
	}
	if (data.timestamp + ONE_YEAR_MS >= Date.now()) {
		return;
	}
	const userId = doc.id;

	console.log(`cleanupUser: Deleting user information for ${userId}`);
	await Promise.all(
		COLLECTION_IDS.map((collectionId) =>
			admin.firestore().collection(collectionId).doc(userId).delete(),
		),
	);

	console.log(`cleanupUser: Deleting user account for ${userId}`);
	await admin.auth().deleteUser(userId);
}

export const cleanupEveryMonth = functions.pubsub
	.schedule('every month')
	.onRun(async () => {
		const now = Date.now();
		console.log(`cleanup: Initializing cleanup at ${now}`);
		const docs = await admin
			.firestore()
			.collection('last-active')
			.listDocuments();
		const tasks = docs.map((doc) =>
			limit(
				cleanupUser,
				doc as FirebaseFirestore.DocumentReference<LastActiveMemory>,
			),
		);
		await Promise.all(tasks);
	});
