import chroma from 'chroma-js';
import blinder from 'color-blind';
import Color from 'colorjs.io';

export function generatePalette(options) {
  const { lightness, chromaValue, minimumDistance, colorBlindMode, p3Mode } = options;
  const uniqueColors = [];

  for (let hue = 0; hue < 360; hue++) {
    const color = createColor(lightness, chromaValue, hue);
    if (shouldAddColor(color, uniqueColors, minimumDistance, colorBlindMode, p3Mode)) {
      uniqueColors.push(color);
    }
  }

  return uniqueColors;
}

function createColor(lightness, chroma, hue) {
  return { lightness, chroma, hue };
}

function shouldAddColor(color, uniqueColors, minimumDistance, colorBlindMode, p3Mode) {
  if (p3Mode && !isInP3Gamut(color)) {
    return false;
  }
  return isDistinctColor(color, uniqueColors, minimumDistance, colorBlindMode);
}

function isInP3Gamut(color) {
  const colorJS = new Color(`oklch(${color.lightness} ${color.chroma} ${color.hue})`);
  return colorJS.inGamut('p3');
}

function isDistinctColor(color, uniqueColors, minimumDistance, colorBlindMode) {
  return uniqueColors.every((uc) => {
    let distance = calculateColorDistance(color, uc);
    if (colorBlindMode) {
      distance = adjustForColorBlindness(color, uc, distance);
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

function adjustForColorBlindness(color, uc, originalDistance) {
  const colorHex = getColorHex(color);
  const ucHex = getColorHex(uc);
  const colorDeuteranomaly = getDeuteranomaly(colorHex);
  const comparisonColorDeuteranomaly = getDeuteranomaly(ucHex);
  return Math.min(
    originalDistance,
    chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly),
  );
}

function getColorHex(color) {
  return chroma.oklch(color.lightness, color.chroma, color.hue).hex();
}

function getDeuteranomaly(colorHex) {
  return blinder.deuteranomaly(colorHex);
}
