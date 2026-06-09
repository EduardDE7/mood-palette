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
 * Normalizes a hex color string to uppercase #RRGGBB format.
 */
export const normalizeHex = (hex: string): string => {
  const trimmedHex = hex.trim().toUpperCase();

  if (trimmedHex.startsWith("#")) {
    return trimmedHex;
  }

  return `#${trimmedHex}`;
};

/**
 * Checks whether a string is a valid 3- or 6-digit hex color.
 */
export const isValidHexColor = (hex: string): boolean =>
  /^(#?[0-9A-F]{3}|#?[0-9A-F]{6})$/i.test(hex.trim());

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

export interface ColorInfo {
  hex: string;
  hsl: string;
  rgb: string;
}

export const getColorInfo = (hex: string): ColorInfo => {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2);
    } else {
      hue = 60 * ((red - green) / delta + 4);
    }
  }

  const normalizedHue = Math.round(hue < 0 ? hue + 360 : hue);
  const normalizedSaturation = Math.round(saturation * 100);
  const normalizedLightness = Math.round(lightness * 100);

  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${normalizedHue}, ${normalizedSaturation}%, ${normalizedLightness}%)`,
  };
};

/**
 * Generates an expanded set of shades and tints for a given HEX color.
 * Generates 2N + 1 shades (e.g. if N = 10, generates 21 shades: 10 tints, base, 10 shades).
 */
export const generateShades = (hex: string, n = 10): string[] => {
  let cleanHex = hex.trim().toUpperCase().replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex =
      cleanHex[0].repeat(2) + cleanHex[1].repeat(2) + cleanHex[2].repeat(2);
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const blend = (
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number,
    factor: number
  ) => {
    const nr = Math.round(r1 + (r2 - r1) * factor);
    const ng = Math.round(g1 + (g2 - g1) * factor);
    const nb = Math.round(b1 + (b2 - b1) * factor);
    const toHex = (c: number) => c.toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
  };

  // Generate N lighter tints (increasing mix with white)
  const tints: string[] = [];
  for (let i = 1; i <= n; i++) {
    const factor = 1 - i / (n + 1);
    tints.push(blend(r, g, b, 255, 255, 255, factor));
  }

  // Generate N darker shades (increasing mix with black)
  const darks: string[] = [];
  for (let i = 1; i <= n; i++) {
    const factor = i / (n + 1);
    darks.push(blend(r, g, b, 0, 0, 0, factor));
  }

  return [...tints, `#${cleanHex}`, ...darks];
};
