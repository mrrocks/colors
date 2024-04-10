import chroma from 'chroma-js';
import { contrastChecker } from './contrastChecker.js';

function colorBlock(color, nextColor, firstColor) {
  const block = document.createElement('div');
  block.classList.add('color');

  const [l, c, h] = color.oklch();
  block.style.backgroundColor = `oklch(${l} ${c} ${h})`;

  const format = document.getElementById('colorFormat').value;

  switch (format) {
    case 'hex':
      block.innerHTML = color.hex();
      break;
    case 'rgb':
      block.innerHTML = color.rgb().join(', ');
      break;
    case 'oklch':
      block.innerHTML = `${l}<br>${c}<br>${h}`;
      break;
    default:
      block.innerHTML = color.hex();
  }

  block.style.color = contrastChecker(color.hex());

  const formatDelta = (delta) =>
    `${(Math.round(delta * 10) / 10).toFixed(1)}% ▸`;

  const deltaNext = formatDelta(
    nextColor
      ? chroma.deltaE(color, nextColor)
      : chroma.deltaE(color, firstColor),
  );

  const deltaSpan = document.createElement('span');
  deltaSpan.className = 'deltas';
  deltaSpan.innerHTML = deltaNext;
  deltaSpan.title = 'Relative color difference against next color';

  block.appendChild(deltaSpan);

  return block;
}

function renderPalette(palette) {
  const grid = document.getElementById('colorGrid');
  if (palette.length === 0) {
    grid.innerHTML =
      '<div class="error">No colors are within the P3 color space</div>';
    return;
  }
  if (paletteChanged(palette, [])) {
    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    palette.forEach((color, index) => {
      const nextColor = palette[index + 1] || palette[0];
      const block = colorBlock(color, nextColor, palette[0]);
      fragment.appendChild(block);
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
