import chroma from "chroma-js";
import { APCAcontrast } from "apca-w3";

const luminosityInput = document.getElementById("luminosityInput");
const luminosityValue = document.getElementById("luminosityValue");
const colorCountInput = document.getElementById("colorCountInput");
const colorCountValue = document.getElementById("colorCountValue");
const gridContainer = document.getElementById("colorGrid");
const thresholdInput = document.getElementById("thresholdInput");
const thresholdValue = document.getElementById("thresholdValue");

function updateColors() {
  const luminosity = parseFloat(luminosityInput.value);
  const colorCount = parseInt(colorCountInput.value);
  const threshold = parseInt(thresholdInput.value);

  let colorScale = chroma
    .scale("Spectral")
    .mode("lch")
    .colors(colorCount)
    .map((color) => chroma(color).luminance(luminosity));
  colorScale = filterDistinctColors(colorScale, threshold);

  gridContainer.innerHTML = "";

  colorScale.forEach((color) => {
    const colorDiv = document.createElement("div");
    colorDiv.style.backgroundColor = color;
    colorDiv.style.color = getTextColor(color);
    colorDiv.innerText = "AA";
    gridContainer.appendChild(colorDiv);
  });
}

luminosityInput.addEventListener("input", () => {
  luminosityValue.textContent = luminosityInput.value;
  updateColors();
});

colorCountInput.addEventListener("input", () => {
  colorCountValue.textContent = colorCountInput.value;
  updateColors();
});

thresholdInput.addEventListener("input", () => {
  thresholdValue.textContent = thresholdInput.value;
  updateColors();
});

function filterDistinctColors(colors, threshold) {
  const distinctColors = [];

  colors.forEach((color) => {
    const isDistinct = distinctColors.every(
      (distinctColor) => chroma.distance(color, distinctColor) >= threshold
    );

    if (isDistinct) {
      distinctColors.push(color);
    }
  });

  return distinctColors;
}

function sRGBtoY(color) {
  const [r, g, b] = color.map((c) => c / 255);
  const R = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getTextColor(backgroundColor) {
  const bgY = sRGBtoY(chroma(backgroundColor).rgb());
  const whiteContrast = APCAcontrast(sRGBtoY([255, 255, 255]), bgY);
  const blackContrast = APCAcontrast(sRGBtoY([0, 0, 0]), bgY);

  return Math.abs(whiteContrast) > Math.abs(blackContrast) ? "white" : "black";
}

updateColors();
