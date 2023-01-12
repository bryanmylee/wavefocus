import {initializeApp} from 'firebase/app';
import browser from 'webextension-polyfill';
import {firebaseConfig} from '../firebase/config';
import {Message} from './messages';
import {initializeNotifications} from './notifications';

const app = initializeApp(firebaseConfig);

browser.runtime.onMessage.addListener(async (message: Message, sender) => {
	if (sender.id == null) return;
});

async function main() {
	initializeNotifications(app);
}

main();
