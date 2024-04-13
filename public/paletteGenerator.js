import chroma from 'chroma-js';
import blinder from 'color-blind';
import Color from 'colorjs.io';

import { getColorHex } from './colorUtils.js';

export const generatePalette = (options) => {
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
};

const shouldAddColor = (color, uniqueColors, distance, colorBlindMode, p3Mode) => {
  if (p3Mode && !isInP3Gamut(color)) {
    return false;
  }
  return isDistinctColor(color, uniqueColors, distance, colorBlindMode);
};

const isInP3Gamut = (color) => {
  const colorJS = new Color(`oklch(${color.lightness} ${color.chroma} ${color.hue})`);
  return colorJS.inGamut('p3');
};

const isDistinctColor = (color, uniqueColors, distance, colorBlindMode) => {
  return uniqueColors.every((uniqueColor) => {
    let distanceCalc = calculateColorDistance(color, uniqueColor);
    if (colorBlindMode) {
      distanceCalc = adjustForColorBlindness(color, uniqueColor, distanceCalc);
    }
    return distanceCalc >= distance;
  });
};

const calculateColorDistance = (color, uniqueColor) => {
  return chroma.deltaE(
    chroma.oklch(color.lightness, color.chroma, color.hue),
    chroma.oklch(uniqueColor.lightness, uniqueColor.chroma, uniqueColor.hue),
  );
};

const adjustForColorBlindness = (color, uniqueColor, originalDistance) => {
  const colorHex = getColorHex(color);
  const uniqueColorHex = getColorHex(uniqueColor);
  const colorDeuteranomaly = getDeuteranomaly(colorHex);
  const comparisonColorDeuteranomaly = getDeuteranomaly(uniqueColorHex);
  return Math.min(originalDistance, chroma.deltaE(colorDeuteranomaly, comparisonColorDeuteranomaly));
};

const getDeuteranomaly = (colorHex) => {
  return blinder.deuteranomaly(colorHex);
};
