/**
 * Generates a random HEX color string.
 */
export const generateRandomHex = (): string => {
  const chars = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Calculates the relative luminance of a color to determine if text should be black or white.
 * Based on YIQ brightness formula.
 */
export const getContrastColor = (hex: string): "black" | "white" => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  // YIQ formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
};
