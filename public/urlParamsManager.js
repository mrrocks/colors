export function updateURLParameters(params) {
  const { lumInput, chromaInput, diffInput, colorFormat, colorBlindMode, p3Mode } = params;
  const colorFormatCode = colorFormat === 'hex' ? 'H' : colorFormat === 'rgb' ? 'R' : 'O';
  const colorBlindModeCode = colorBlindMode ? '1' : '0';
  const p3ModeCode = p3Mode ? '1' : '0';
  const compactParams = `${lumInput}${chromaInput}${diffInput}${colorFormatCode}${colorBlindModeCode}${p3ModeCode}`;
  history.replaceState(null, null, '?' + compactParams);
}

export function getUrlParams() {
  const search = window.location.search.substring(1);
  const lumInput = search.substring(0, 2);
  const chromaInput = search.substring(2, 4);
  const diffInput = search.substring(4, 6);
  const colorFormatCode = search.charAt(6);
  const colorBlindModeCode = search.charAt(7);
  const p3ModeCode = search.charAt(8);

  return {
    lumInput,
    chromaInput,
    diffInput,
    colorFormat: colorFormatCode === 'H' ? 'hex' : colorFormatCode === 'R' ? 'rgb' : 'oklch',
    colorBlindMode: colorBlindModeCode === '1',
    p3Mode: p3ModeCode === '1',
  };
}
