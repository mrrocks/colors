const FORMAT_MAPPING = {
  hex: 'H',
  rgb: 'R',
  oklch: 'O',
};

const REVERSE_FORMAT_MAPPING = {
  H: 'hex',
  R: 'rgb',
  O: 'oklch',
};

const PARAM_LENGTH = 2;
const PERCENT_MULTIPLIER = 100;

function encodeParams(params) {
  const lightnessStr = Math.round(params.lightness * PERCENT_MULTIPLIER)
    .toString()
    .padStart(PARAM_LENGTH, '0');
  const chromaStr = Math.round(params.chroma * PERCENT_MULTIPLIER)
    .toString()
    .padStart(PARAM_LENGTH, '0');
  const distanceStr = params.distance.toString().padStart(PARAM_LENGTH, '0');
  const colorFormatCode = FORMAT_MAPPING[params.colorFormat];
  const colorBlindModeCode = params.colorBlindMode ? '1' : '0';
  const p3ModeCode = params.p3Mode ? '1' : '0';

  return `${lightnessStr}${chromaStr}${distanceStr}${colorFormatCode}${colorBlindModeCode}${p3ModeCode}`;
}

function decodeParams(search) {
  return {
    lightness: parseInt(search.substring(0, 2), 10) / PERCENT_MULTIPLIER,
    chroma: parseInt(search.substring(2, 4), 10) / PERCENT_MULTIPLIER,
    distance: parseInt(search.substring(4, 6), 10),
    colorFormat: REVERSE_FORMAT_MAPPING[search.charAt(6)],
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
