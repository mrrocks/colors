import { getUrlParams } from './urlParamsManager.js';

export function saveSettings(settings) {
  localStorage.clear();
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

export function retrieveLocalStorageSettings() {
  const settings = {};
  const keys = ['lightness', 'chroma', 'distance', 'colorFormat', 'colorBlindMode', 'p3Mode'];
  keys.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      if (key === 'colorBlindMode' || key === 'p3Mode') {
        settings[key] = value === 'true';
      } else if (key === 'colorFormat') {
        settings[key] = value;
      } else {
        settings[key] = parseFloat(value);
      }
    }
  });
  return settings;
}

export function initializeSettings(defaults) {
  const urlParams = getUrlParams();
  const localStorageSettings = retrieveLocalStorageSettings();
  const settings = { ...defaults, ...localStorageSettings, ...urlParams };
  return settings;
}
