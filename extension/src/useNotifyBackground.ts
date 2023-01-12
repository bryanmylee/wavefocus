import browser from 'webextension-polyfill';
import { useEffect } from "react";
import { PopupOpenMessage } from './background/messages';

export function useNotifyBackground() {
  useEffect(function notifyBackground() {
    browser.runtime.sendMessage(undefined, { type: 'popup_open' } satisfies PopupOpenMessage)
  }, []);
}