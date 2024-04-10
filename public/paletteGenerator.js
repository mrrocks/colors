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

  for (let hue = 0; hue < 360; hue++) {
    let color = chroma.oklch(lightnessValue, chromaValue, hue);
    let colorJS = new Color(`oklch(${lightnessValue} ${chromaValue} ${hue})`);

    if (
      isColorToAdd(
        color,
        colorJS,
        uniqueColors,
        minimumDistance,
        colorBlindModeEnabled,
        p3ModeEnabled,
      )
    ) {
      uniqueColors.push(color);
    }
  }
  return uniqueColors;
}

function isColorToAdd(
  color,
  colorJS,
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
  p3ModeEnabled,
) {
  return (
    (!p3ModeEnabled || isWithinP3Gamut(colorJS)) &&
    isDistinctColor(color, uniqueColors, minimumDistance, colorBlindModeEnabled)
  );
}

function isWithinP3Gamut(colorJS) {
  return colorJS.inGamut('p3');
}

function isDistinctColor(
  color,
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
) {
  return uniqueColors.every((uc) => {
    let distance = chroma.deltaE(color.hex(), uc.hex());
    if (colorBlindModeEnabled) {
      distance = Math.min(
        distance,
        getAdjustedDistanceForColorBlindness(color, uc),
      );
    }
    return distance >= minimumDistance;
  });
}

function getAdjustedDistanceForColorBlindness(color, comparisonColor) {
  const colorDeuteranomaly = chroma(blinder.deuteranomaly(color.hex())).hex();
  const comparisonColorDeuteranomaly = chroma(
    blinder.deuteranomaly(comparisonColor.hex()),
  ).hex();
  return chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly);
}
