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

  lightnessSlider.value = defaultValues.lightness.toString();
  chromaSlider.value = defaultValues.chroma.toString();
  distanceSlider.value = defaultValues.distance.toString();
  colorBlindModeCheckbox.checked = defaultValues.colorBlindMode;
  colorFormatSelect.value = defaultValues.colorFormat;
  p3ModeCheckbox.checked = defaultValues.p3Mode;

  syncValues(
    lightnessSlider,
    document.getElementById('lightnessValue'),
    defaultValues.lightness.toString(),
  );
  syncValues(chromaSlider, document.getElementById('chromaValue'), defaultValues.chroma.toString());
  syncValues(
    distanceSlider,
    document.getElementById('distanceValue'),
    defaultValues.distance.toString(),
  );

  refreshGrid(true);
}
