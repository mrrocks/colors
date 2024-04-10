import chroma from 'chroma-js';
import { APCAcontrast, sRGBtoY } from 'apca-w3';

export function contrastChecker(bgColor) {
  const bgLum = sRGBtoY(chroma(bgColor).rgb());
  const whiteLum = sRGBtoY([255, 255, 255]);
  const blackLum = sRGBtoY([0, 0, 0]);
  const contrastWhite = APCAcontrast(whiteLum, bgLum);
  const contrastBlack = APCAcontrast(blackLum, bgLum);
  return Math.abs(contrastWhite) > Math.abs(contrastBlack)
    ? 'rgba(255, 255, 255, 0.92)'
    : 'rgba(0, 0, 0, 0.92)';
}
