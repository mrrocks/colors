import { syncValues, refreshGrid } from './main.js';

export function resetControls(elements, defaults) {
  const { lightnessSlider, chromaSlider, distanceSlider, colorBlindModeCheckbox, colorFormatSelect, p3ModeCheckbox } =
    elements;

  lightnessSlider.value = defaults.lightness.toString();
  chromaSlider.value = defaults.chroma.toString();
  distanceSlider.value = defaults.distance.toString();
  colorBlindModeCheckbox.checked = defaults.colorBlindMode;
  colorFormatSelect.value = defaults.colorFormat;
  p3ModeCheckbox.checked = defaults.p3Mode;

  syncValues(lightnessSlider, document.getElementById('lightnessValue'), defaults.lightness);
  syncValues(chromaSlider, document.getElementById('chromaValue'), defaults.chroma);
  syncValues(distanceSlider, document.getElementById('distanceValue'), defaults.distance);

  refreshGrid(true);
}
