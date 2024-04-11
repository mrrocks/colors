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
    const color = { lightness: lightnessValue, chroma: chromaValue, hue };
    if (
      isColorToAdd(
        color,
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
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
  p3ModeEnabled,
  colorBlindCache,
) {
  if (p3ModeEnabled && !isInP3Gamut(color)) {
    return false;
  }
  return isDistinctColor(
    color,
    uniqueColors,
    minimumDistance,
    colorBlindModeEnabled,
    colorBlindCache,
  );
}

function isInP3Gamut(color) {
  const colorJS = new Color(`oklch(${color.lightness} ${color.chroma} ${color.hue})`);
  return colorJS.inGamut('p3');
}

function isDistinctColor(
  color,
  uniqueColors,
  minimumDistance,
  colorBlindModeEnabled,
  colorBlindCache,
) {
  return uniqueColors.every((uc) => {
    let distance = calculateColorDistance(color, uc);
    if (colorBlindModeEnabled) {
      distance = adjustForColorBlindness(color, uc, colorBlindCache, distance);
    }
    return distance >= minimumDistance;
  });
}

function calculateColorDistance(color, uc) {
  return chroma.deltaE(
    chroma.oklch(color.lightness, color.chroma, color.hue),
    chroma.oklch(uc.lightness, uc.chroma, uc.hue),
  );
}

function adjustForColorBlindness(color, uc, colorBlindCache, originalDistance) {
  const colorHex = getColorHex(color);
  const ucHex = getColorHex(uc);
  const colorDeuteranomaly = getDeuteranomaly(colorHex, colorBlindCache);
  const comparisonColorDeuteranomaly = getDeuteranomaly(ucHex, colorBlindCache);
  return Math.min(
    originalDistance,
    chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly),
  );
}

function getColorHex(color) {
  return chroma.oklch(color.lightness, color.chroma, color.hue).hex();
}

function getDeuteranomaly(colorHex, colorBlindCache) {
  return (
    colorBlindCache[colorHex] ||
    (colorBlindCache[colorHex] = chroma(blinder.deuteranomaly(colorHex)).hex())
  );
}
