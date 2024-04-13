export function saveSettings(settings) {
  localStorage.clear();
  Object.entries(settings).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}
