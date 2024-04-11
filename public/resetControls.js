import { syncValues, refreshGrid } from './main.js';

export function resetControls(elements, defaultValues) {
  const {
    lumSlider,
    chromaSlider,
    diffSlider,
    colorBlindModeCheckbox,
    colorFormatSelect,
    p3ModeCheckbox,
  } = elements;

  lumSlider.value = defaultValues.lumInput;
  chromaSlider.value = defaultValues.chromaInput;
  diffSlider.value = defaultValues.diffInput;
  colorBlindModeCheckbox.checked = defaultValues.colorBlindMode;
  colorFormatSelect.value = defaultValues.colorFormat;
  p3ModeCheckbox.checked = defaultValues.p3Mode;

  syncValues(lumSlider, document.getElementById('lumValue'), defaultValues.lumInput);
  syncValues(chromaSlider, document.getElementById('chromaValue'), defaultValues.chromaInput);
  syncValues(diffSlider, document.getElementById('diffValue'), defaultValues.diffInput);

  refreshGrid(true);
}
