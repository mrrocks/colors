export const updateSliderBackground = (slider, value) => {
  slider.style.backgroundSize = `${((value - slider.min) / (slider.max - slider.min)) * 100}% 100%`;
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
