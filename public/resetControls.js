import { syncValues, refreshGrid } from './main.js';

export function resetControls(elements, defaultValues) {
  const {
    lightnessSlider,
    chromaSlider,
    distanceSlider,
    colorBlindModeCheckbox,
    colorFormatSelect,
    p3ModeCheckbox,
  } = elements;

  lightnessSlider.value = defaultValues.lightness;
  chromaSlider.value = defaultValues.chroma;
  distanceSlider.value = defaultValues.distance;
  colorBlindModeCheckbox.checked = defaultValues.colorBlindMode;
  colorFormatSelect.value = defaultValues.colorFormat;
  p3ModeCheckbox.checked = defaultValues.p3Mode;

  syncValues(lightnessSlider, document.getElementById('lightnessValue'), defaultValues.lightness);
  syncValues(chromaSlider, document.getElementById('chromaValue'), defaultValues.chroma);
  syncValues(distanceSlider, document.getElementById('distanceValue'), defaultValues.distance);

  refreshGrid(true);
}
