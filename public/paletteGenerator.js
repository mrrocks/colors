import chroma from 'chroma-js';
import blinder from 'color-blind';
import Color from 'colorjs.io';

export function generatePalette(
  lightnessValue,
  chromaValue,
  minimumDistance,
  colorBlindModeEnabled,
  p3ModeEnabled,
) {
  const uniqueColors = [];
  const colorBlindCache = {};

  for (let hue = 0; hue < 360; hue++) {
    let color = chroma.oklch(lightnessValue, chromaValue, hue);
    if (
      isColorToAdd(
        color,
        lightnessValue,
        chromaValue,
        hue,
        uniqueColors,
        minimumDistance,
        colorBlindModeEnabled,
        p3ModeEnabled,
        colorBlindCache,
      )
    ) {
      uniqueColors.push(color);
    }
  }
  return uniqueColors;
}

function isColorToAdd(
  color,
  lightnessValue,
  chromaValue,
  hue,
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
  p3ModeEnabled,
  colorBlindCache,
) {
  let colorJS;
  if (p3ModeEnabled) {
    colorJS = new Color(`oklch(${lightnessValue} ${chromaValue} ${hue})`);
    if (!colorJS.inGamut('p3')) return false;
  }
  return isDistinctColor(
    color,
    uniqueColors,
    minimumDistance,
    colorBlindModeEnabled,
    colorBlindCache,
  );
}

function isDistinctColor(
  color,
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
  colorBlindCache,
) {
  return uniqueColors.every((uc) => {
    let distance = chroma.deltaE(color.hex(), uc.hex());
    if (colorBlindModeEnabled) {
      const colorHex = color.hex();
      const ucHex = uc.hex();
      const colorDeuteranomaly =
        colorBlindCache[colorHex] ||
        (colorBlindCache[colorHex] = chroma(
          blinder.deuteranomaly(colorHex),
        ).hex());
      const comparisonColorDeuteranomaly =
        colorBlindCache[ucHex] ||
        (colorBlindCache[ucHex] = chroma(blinder.deuteranomaly(ucHex)).hex());
      distance = Math.min(
        distance,
        chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly),
      );
    }
    return distance >= minimumDistance;
  });
}
