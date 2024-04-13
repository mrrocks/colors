import chroma from 'chroma-js';
import blinder from 'color-blind';
import Color from 'colorjs.io';

import colorUtils from './colorUtils.js';

export function generatePalette(options) {
  const { lightness, chroma, distance, colorBlindMode, p3Mode } = options;
  const uniqueColors = [];
  const colorCache = new Map();

  for (let hue = 0; hue < 360; hue += 2) {
    const color = { lightness, chroma, hue };
    const colorKey = `${lightness}-${chroma}-${hue}`;
    if (!colorCache.has(colorKey) && shouldAddColor(color, uniqueColors, distance, colorBlindMode, p3Mode)) {
      uniqueColors.push(color);
      colorCache.set(colorKey, color);
    }
  }
  return uniqueColors;
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
  for (const uniqueColor of uniqueColors) {
    let distanceCalc = calculateColorDistance(color, uniqueColor);
    if (colorBlindMode) {
      distanceCalc = adjustForColorBlindness(color, uniqueColor, distanceCalc);
    }
    if (distanceCalc < distance) {
      return false;
    }
  }
  return true;
}

function calculateColorDistance(color, uniqueColor) {
  return chroma.deltaE(
    chroma.oklch(color.lightness, color.chroma, color.hue),
    chroma.oklch(uniqueColor.lightness, uniqueColor.chroma, uniqueColor.hue),
  );
}

function adjustForColorBlindness(color, uniqueColor, originalDistance) {
  const colorHex = colorUtils.getColorHex(color);
  const uniqueColorHex = colorUtils.getColorHex(uniqueColor);
  const colorDeuteranomaly = getDeuteranomaly(colorHex);
  const comparisonColorDeuteranomaly = getDeuteranomaly(uniqueColorHex);
  return Math.min(originalDistance, chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly));
}

function getDeuteranomaly(colorHex) {
  return blinder.deuteranomaly(colorHex);
}
