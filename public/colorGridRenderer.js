import chroma from 'chroma-js';
import { contrastChecker } from './contrastChecker.js';
import { getColorHex, getColorObj } from './colorUtils.js';

const createColorBlock = (color, nextColor, firstColor) => {
  const block = document.createElement('div');
  block.className = 'color';
  block.style.backgroundColor = `oklch(${color.lightness} ${color.chroma} ${color.hue})`;
  block.innerHTML = getColorContent(color);
  block.style.color = contrastChecker(getColorHex(color));
  appendDeltaSpan(block, color, nextColor || firstColor);
  return block;
};

const getColorContent = (color) => {
  const format = document.getElementById('colorFormat').value;
  const colorObj = getColorObj(color);
  switch (format) {
    case 'hex':
      return colorObj.hex();
    case 'rgb':
      return colorObj.rgb().join(',');
    case 'oklch':
      return `${color.lightness},${color.chroma},${color.hue}`;
    default:
      return color;
  }
};

const appendDeltaSpan = (block, color, comparisonColor) => {
  const deltaNext = formatDelta(calculateDelta(color, comparisonColor));
  const deltaSpan = document.createElement('span');
  deltaSpan.className = 'deltas';
  deltaSpan.innerHTML = deltaNext;
  deltaSpan.title = 'Relative color difference against next color';
  block.appendChild(deltaSpan);
};

const calculateDelta = (color, comparisonColor) => {
  return chroma.deltaE(getColorHex(color), getColorHex(comparisonColor));
};

const formatDelta = (delta) => {
  return `${(Math.round(delta * 10) / 10).toFixed(1)}% ▸`;
};

const paletteChanged = (oldPalette, newPalette) => {
  return (
    oldPalette.length !== newPalette.length ||
    !oldPalette.every((val, index) => getColorHex(val) === getColorHex(newPalette[index]))
  );
};

export const renderPalette = (palette) => {
  const grid = document.getElementById('colorGrid');
  if (palette.length === 0) {
    grid.innerHTML = '<div class="error">No colors are within the P3 color space</div>';
    return;
  }
  if (paletteChanged(palette, [])) {
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    palette.forEach((color, index) => {
      const nextColor = palette[index + 1] || palette[0];
      fragment.appendChild(createColorBlock(color, nextColor, palette[0]));
    });
    grid.appendChild(fragment);
  }
};
