import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY, alphaBlend } from 'apca-w3';

const WHITE_RGBA = [255, 255, 255, 0.92];
const BLACK_RGBA = [0, 0, 0, 0.92];

const blendColorsWithBackground = (color, backgroundColor) => alphaBlend(color, backgroundColor);

const calculateLuminance = (color) => sRGBtoY(color);

const determineHigherContrast = (contrast1, contrast2) =>
  Math.abs(contrast1) > Math.abs(contrast2) ? `rgba(${WHITE_RGBA.join(', ')})` : `rgba(${BLACK_RGBA.join(', ')})`;

export const contrastChecker = (bgColor) => {
  const bgColorArray = chroma(bgColor).rgb();

  const blendedWhite = blendColorsWithBackground(WHITE_RGBA, bgColorArray);
  const blendedBlack = blendColorsWithBackground(BLACK_RGBA, bgColorArray);

  const bgLum = calculateLuminance(bgColorArray);
  const whiteLum = calculateLuminance(blendedWhite);
  const blackLum = calculateLuminance(blendedBlack);

  const contrastWhite = APCAcontrast(whiteLum, bgLum);
  const contrastBlack = APCAcontrast(blackLum, bgLum);

  return determineHigherContrast(contrastWhite, contrastBlack);
};
