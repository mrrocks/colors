export function updateSliderBackground(slider, value) {
  slider.style.backgroundSize = `${((value - slider.min) / (slider.max - slider.min)) * 100}% 100%`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
