import chroma from 'chroma-js'; // Ensure you import the library

function exportColors(palette, format) {
  let colorText = palette
    .map((color) => {
      // Assuming color is an object with properties lightness, chroma, and hue
      let colorObj = chroma.oklch(color.lightness, color.chroma, color.hue);
      switch (format) {
        case 'hex':
          return colorObj.hex();
        case 'rgb':
          return `rgb(${colorObj.rgb().join(', ')})`;
        case 'oklch':
          return `oklch(${color.lightness} ${color.chroma} ${color.hue})`;
        default:
          return '';
      }
    })
    .join('\n');

  const blob = new Blob([colorText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${format}-colors.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export { exportColors };
