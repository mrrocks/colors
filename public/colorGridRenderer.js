import chroma from 'chroma-js';
import { contrastChecker } from './contrastChecker.js';

function createColorBlock(color, nextColor, firstColor) {
  const block = document.createElement('div');
  block.className = 'color';
  block.style.backgroundColor = getColorStyle(color);
  block.innerHTML = getColorContent(color);
  block.style.color = contrastChecker(chroma.oklch(...Object.values(color)).hex());
  appendDeltaSpan(block, color, nextColor || firstColor);
  return block;
}

function getColorStyle(color) {
  return `oklch(${color.lightness} ${color.chroma} ${color.hue})`;
}

function getColorContent(color) {
  const format = document.getElementById('colorFormat').value;
  const colorObj = chroma.oklch(...Object.values(color));
  switch (format) {
    case 'hex':
      return colorObj.hex();
    case 'rgb':
      return colorObj.rgb();
    case 'oklch':
      return `${color.lightness},${color.chroma},${color.hue}`;
    default:
      return color;
  }
}

function appendDeltaSpan(block, color, comparisonColor) {
  const deltaNext = formatDelta(calculateDelta(color, comparisonColor));
  const deltaSpan = document.createElement('span');
  deltaSpan.className = 'deltas';
  deltaSpan.innerHTML = deltaNext;
  deltaSpan.title = 'Relative color difference against next color';
  block.appendChild(deltaSpan);
}

function calculateDelta(color, comparisonColor) {
  const colorHex = chroma.oklch(...Object.values(color)).hex();
  const comparisonHex = chroma.oklch(...Object.values(comparisonColor)).hex();
  return chroma.deltaE(colorHex, comparisonHex);
}

function formatDelta(delta) {
  return `${(Math.round(delta * 10) / 10).toFixed(1)}% ▸`;
}

function renderPalette(palette) {
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
}

function paletteChanged(oldPalette, newPalette) {
  return (
    oldPalette.length !== newPalette.length ||
    !oldPalette.every((val, index) => val.hex() === newPalette[index].hex())
  );
}

export { renderPalette };
