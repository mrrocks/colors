import { refreshGrid } from './main.js';
import { updateSliderBackground } from './utils.js';

export function resetControls(defaultValues) {
  Object.entries(defaultValues).forEach(([key, value]) => {
    const element = document.getElementById(key);
    if (element.type === 'checkbox') {
      element.checked = value;
    } else {
      element.value = value;
      if (element.type === 'range') {
        updateSliderBackground(element, value);
      }
    }
    localStorage.setItem(key, value.toString());
  });
  refreshGrid();
}
