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
