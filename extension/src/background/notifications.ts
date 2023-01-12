import {FirebaseApp} from 'firebase/app';
import browser from 'webextension-polyfill';
import {fcmSenderId} from '../firebase/config';

export type Notification = {
	title: string;
	body: string;
};

export const FOCUS_END_NOTIFICATION: Notification = {
	title: 'Focus over!',
	body: 'Take a five minute break.',
};

export const RELAX_END_NOTIFICATION: Notification = {
	title: 'Ready to focus again?',
	body: 'Get 25 minutes of uninterrupted work done.',
};

/**
 * Chrome-specific.
 */
type GCMPrefixed<TData> = {
	[TKey in keyof TData as `gcm.notification.${TKey extends string
		? TKey
		: never}`]: TData[TKey];
};

interface GCMMessage<TData = Record<string, string>> {
	collapseKey: string;
	data: GCMPrefixed<TData>;
}

declare let chrome: {
	gcm: {
		register(senderIds: string[], onRegister: (token: string) => void): void;
		onMessage: {
			addListener(onMessage: (message: GCMMessage) => void): void;
		};
	};
};

export function initializeNotifications(app: FirebaseApp) {
	if (typeof chrome !== 'undefined') {
		chrome_registerGcm();
		chrome_addMessageListener();
		return;
	}
	console.warn(
		"Firebase Cloud Messaging not supported in this browser's extensions",
	);
}

function chrome_registerGcm() {
	chrome.gcm.register([fcmSenderId], onTokenRegistered);
}

async function onTokenRegistered(token: string) {
	await browser.storage.local.set({fcm_token: token});
}

function chrome_addMessageListener() {
	chrome.gcm.onMessage.addListener((message) => {
		const data = message.data as GCMPrefixed<Notification>;
		onNotification({
			title: data['gcm.notification.title'],
			body: data['gcm.notification.body'],
		});
	});
}

function onNotification(notification: Notification) {
	browser.notifications.create({
		type: 'basic',
		iconUrl: browser.runtime.getURL('assets/icon-128.png'),
		title: notification.title,
		message: notification.body,
	});
}
