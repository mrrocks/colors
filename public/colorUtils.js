import chroma from 'chroma-js';

const colorCache = new Map();

export function getColorHex(color) {
  return getColorObj(color).hex();
}

export function getColorObj(color) {
  const key = JSON.stringify(color);
  if (!colorCache.has(key)) {
    colorCache.set(key, chroma.oklch(color.lightness, color.chroma, color.hue));
  }
  return colorCache.get(key);
}
