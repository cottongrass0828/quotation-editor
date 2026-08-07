import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

export async function storageGet(key) {
  if (isNative) {
    const { value } = await Preferences.get({ key });
    return value; // string | null
  }
  return localStorage.getItem(key);
}

export async function storageSet(key, value) {
  if (isNative) return Preferences.set({ key, value });
  localStorage.setItem(key, value);
}

export async function storageRemove(key) {
  if (isNative) return Preferences.remove({ key });
  localStorage.removeItem(key);
}
