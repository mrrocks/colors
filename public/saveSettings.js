export function saveSettings(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}
