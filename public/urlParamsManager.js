const formatMapping = {
  hex: 'H',
  rgb: 'R',
  oklch: 'O',
};

const reverseFormatMapping = {
  H: 'hex',
  R: 'rgb',
  O: 'oklch',
};

function encodeParams(params) {
  const { lightness, chroma, distance, colorFormat, colorBlindMode, p3Mode } = params;
  return `${lightness.padStart(2, '0')}${chroma.padStart(2, '0')}${distance.padStart(2, '0')}${formatMapping[colorFormat]}${colorBlindMode ? '1' : '0'}${p3Mode ? '1' : '0'}`;
}

function decodeParams(search) {
  return {
    lightness: search.substring(0, 2),
    chroma: search.substring(2, 4),
    distance: search.substring(4, 6),
    colorFormat: reverseFormatMapping[search.charAt(6)],
    colorBlindMode: search.charAt(7) === '1',
    p3Mode: search.charAt(8) === '1',
  };
}
export function updateURLParameters(params) {
  const compactParams = encodeParams(params);
  history.replaceState(null, null, `?${compactParams}`);
}

export function getUrlParams() {
  const search = window.location.search.substring(1);
  return decodeParams(search);
}
