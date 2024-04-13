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

const encodeParams = (params) => {
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
};

const decodeParams = (search) => {
  const lightness = parseInt(search.substring(0, 2), 10) / PERCENT_MULTIPLIER;
  const chroma = parseInt(search.substring(2, 4), 10) / PERCENT_MULTIPLIER;
  const distance = parseInt(search.substring(4, 6), 10);
  const colorFormat = REVERSE_FORMAT_MAPPING[search.charAt(6)];
  const colorBlindMode = search.charAt(7) === '1';
  const p3Mode = search.charAt(8) === '1';

  return { lightness, chroma, distance, colorFormat, colorBlindMode, p3Mode };
};

export const updateURLParameters = (params) => {
  const compactParams = encodeParams(params);
  history.replaceState(null, null, `?${compactParams}`);
};

export const getUrlParams = () => {
  const search = window.location.search.substring(1);
  return search ? decodeParams(search) : {};
};
