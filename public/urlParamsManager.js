let debounceTimer;

export function updateURLParameters(params) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const queryParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      queryParams.set(key, value);
    });
    history.replaceState(null, null, '?' + queryParams.toString());
  }, 250);
}

export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    lumInput: params.get('L'),
    chromaInput: params.get('C'),
    diffInput: params.get('D'),
    colorFormat: params.get('F'),
    colorBlindMode: params.get('CB') === 'ON',
    p3Mode: params.get('P3') === 'ON',
  };
}
