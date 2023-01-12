import browser from 'webextension-polyfill';
import {fcmSenderId} from './firebase/config';
import {Notification} from './notifications';

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

/**
 * Main
 */
async function main() {
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

async function onTokenRegistered(fcmToken: string) {
	await browser.storage.local.set({fcm_token: fcmToken});
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

main();
