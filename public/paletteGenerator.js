import chroma from 'chroma-js';
import blinder from 'color-blind';
import Color from 'colorjs.io';

export function generatePalette(options) {
  const { lightness, chroma, distance, colorBlindMode, p3Mode } = options;
  const uniqueColors = [];
  const colorCache = new Map();

  for (let hue = 0; hue < 360; hue += 2) {
    const color = createColor(lightness, chroma, hue);
    const colorKey = `${lightness}-${chroma}-${hue}`;
    if (!colorCache.has(colorKey) && shouldAddColor(color, uniqueColors, distance, colorBlindMode, p3Mode)) {
      uniqueColors.push(color);
      colorCache.set(colorKey, color);
    }
  }

  return uniqueColors;
}

function createColor(lightness, chroma, hue) {
  return { lightness, chroma, hue };
}

function shouldAddColor(color, uniqueColors, distance, colorBlindMode, p3Mode) {
  if (p3Mode && !isInP3Gamut(color)) {
    return false;
  }
  return isDistinctColor(color, uniqueColors, distance, colorBlindMode);
}

function isInP3Gamut(color) {
  const colorJS = new Color(`oklch(${color.lightness} ${color.chroma} ${color.hue})`);
  return colorJS.inGamut('p3');
}

function isDistinctColor(color, uniqueColors, distance, colorBlindMode) {
  for (const uc of uniqueColors) {
    let distanceCalc = calculateColorDistance(color, uc);
    if (colorBlindMode) {
      distanceCalc = adjustForColorBlindness(color, uc, distanceCalc);
    }
    if (distanceCalc < distance) {
      return false;
    }
  }
  return true;
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
  return Math.min(originalDistance, chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly));
}

function getColorHex(color) {
  return chroma.oklch(color.lightness, color.chroma, color.hue).hex();
}

function getDeuteranomaly(colorHex) {
  return blinder.deuteranomaly(colorHex);
}
