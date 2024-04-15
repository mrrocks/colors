import { getUrlParams } from './urlParamsManager.js';

let lastSettings = {};

export const settingsHaveChanged = (newSettings) => {
  return Object.keys(newSettings).some((key) => newSettings[key] !== lastSettings[key]);
};

export const getCurrentSettings = (elements) => {
  return {
    lightness: parseFloat(elements.lightnessSlider.value),
    chroma: parseFloat(elements.chromaSlider.value),
    distance: parseInt(elements.distanceSlider.value),
    colorBlindMode: elements.colorBlindModeCheckbox.checked,
    p3Mode: elements.p3ModeCheckbox.checked,
    colorFormat: elements.colorFormatSelect.value,
  };
};

export const saveSettings = (settings) => {
  localStorage.clear();
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

export const retrieveLocalStorageSettings = () => {
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
};

export const initializeSettings = (defaults) => {
  const urlParams = getUrlParams();
  const localStorageSettings = retrieveLocalStorageSettings();
  const settings = { ...defaults, ...localStorageSettings, ...urlParams };
  return settings;
};
