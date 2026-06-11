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

const getRgbChannels = (hex: string) => {
  const cleanHex = normalizeHex(hex).replace("#", "");

  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  };
};

const getLinearSrgbChannel = (channel: number) => {
  const normalizedChannel = channel / 255;

  return normalizedChannel <= 0.03928
    ? normalizedChannel / 12.92
    : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
};

export const getRelativeLuminance = (hex: string) => {
  const { r, g, b } = getRgbChannels(hex);

  return (
    0.2126 * getLinearSrgbChannel(r) +
    0.7152 * getLinearSrgbChannel(g) +
    0.0722 * getLinearSrgbChannel(b)
  );
};

export const getContrastRatio = (firstHex: string, secondHex: string) => {
  const firstLuminance = getRelativeLuminance(firstHex);
  const secondLuminance = getRelativeLuminance(secondHex);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

export const formatContrastRatio = (ratio: number) => `${ratio.toFixed(2)}:1`;

export type WcagContrastLevel = "AAA" | "AA" | "UI" | "Fail";

export const getWcagContrastLevel = (ratio: number): WcagContrastLevel => {
  if (ratio >= 7) {
    return "AAA";
  }

  if (ratio >= 4.5) {
    return "AA";
  }

  if (ratio >= 3) {
    return "UI";
  }

  return "Fail";
};

export type ColorHarmonyMode =
  | "complementary"
  | "analogous"
  | "triadic"
  | "monochrome"
  | "split-complementary";

export type ColorBlindnessMode =
  | "normal"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia";

export const COLOR_BLINDNESS_LABELS: Record<ColorBlindnessMode, string> = {
  normal: "Normal",
  deuteranopia: "Deuteranopia",
  protanopia: "Protanopia",
  tritanopia: "Tritanopia",
};

const COLOR_BLINDNESS_MATRICES: Record<
  Exclude<ColorBlindnessMode, "normal">,
  [[number, number, number], [number, number, number], [number, number, number]]
> = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

export const simulateColorBlindness = (
  hex: string,
  mode: ColorBlindnessMode
) => {
  if (mode === "normal") {
    return normalizeHex(hex);
  }

  const { r, g, b } = getRgbChannels(hex);
  const matrix = COLOR_BLINDNESS_MATRICES[mode];
  const channels = matrix.map((row) =>
    clamp(row[0] * r + row[1] * g + row[2] * b, 0, 255)
  );
  const toHex = (channel: number) =>
    Math.round(channel).toString(16).padStart(2, "0").toUpperCase();

  return `#${toHex(channels[0])}${toHex(channels[1])}${toHex(channels[2])}`;
};

const HARMONY_HUE_OFFSETS: Record<
  Exclude<ColorHarmonyMode, "monochrome">,
  number[]
> = {
  complementary: [0, 180, 30, 210, -30, 150, -60, 120],
  analogous: [0, -30, 30, -60, 60, -90, 90, -120],
  triadic: [0, 120, 240, 60, 180, 300, 30, 210],
  "split-complementary": [0, 150, 210, 30, 330, 180, 60, 300],
};

const MONOCHROME_LIGHTNESS_OFFSETS = [0, 14, -14, 26, -26, 38, -38, 48];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360;

const getHarmonyStepIndex = (colorIndex: number, anchorIndex: number) => {
  if (colorIndex === anchorIndex) {
    return 0;
  }

  const distance = Math.abs(colorIndex - anchorIndex);

  return colorIndex > anchorIndex ? distance * 2 - 1 : distance * 2;
};

const rgbToHsl = (hex: string) => {
  const { r, g, b } = getRgbChannels(hex);
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

  return {
    hue: wrapHue(hue),
    saturation: saturation * 100,
    lightness: lightness * 100,
  };
};

export interface HslChannels {
  hue: number;
  saturation: number;
  lightness: number;
}

export const getHslChannels = (hex: string): HslChannels => rgbToHsl(hex);

export interface PaletteScoreMetric {
  description: string;
  key: string;
  label: string;
  score: number;
}

export interface PaletteScore {
  label: "Excellent" | "Good" | "Fair" | "Needs work";
  metrics: PaletteScoreMetric[];
  score: number;
  warnings: string[];
}

const getPairwiseValues = <T>(
  values: T[],
  getPairValue: (first: T, second: T) => number
) => {
  const pairValues: number[] = [];

  for (let firstIndex = 0; firstIndex < values.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < values.length;
      secondIndex += 1
    ) {
      pairValues.push(getPairValue(values[firstIndex], values[secondIndex]));
    }
  }

  return pairValues;
};

const getAverage = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;

const getCircularHueDistance = (firstHue: number, secondHue: number) => {
  const directDistance = Math.abs(firstHue - secondHue);

  return Math.min(directDistance, 360 - directDistance);
};

const getRgbDistance = (firstHex: string, secondHex: string) => {
  const first = getRgbChannels(firstHex);
  const second = getRgbChannels(secondHex);

  return Math.sqrt(
    (first.r - second.r) ** 2 +
      (first.g - second.g) ** 2 +
      (first.b - second.b) ** 2
  );
};

const getPaletteScoreLabel = (score: number): PaletteScore["label"] => {
  if (score >= 82) {
    return "Excellent";
  }

  if (score >= 68) {
    return "Good";
  }

  if (score >= 52) {
    return "Fair";
  }

  return "Needs work";
};

export const scorePalette = (hexes: string[]): PaletteScore => {
  const normalizedHexes = hexes.map(normalizeHex);
  const hslValues = normalizedHexes.map(getHslChannels);
  const saturatedHues = hslValues.filter((color) => color.saturation >= 10);
  const pairwiseContrast = getPairwiseValues(normalizedHexes, getContrastRatio);
  const pairwiseRgbDistance = getPairwiseValues(
    normalizedHexes,
    getRgbDistance
  );
  const pairwiseHueDistance = getPairwiseValues(
    saturatedHues,
    (first, second) => getCircularHueDistance(first.hue, second.hue)
  );
  const averageContrast = getAverage(pairwiseContrast);
  const nearestRgbDistance =
    pairwiseRgbDistance.length === 0 ? 0 : Math.min(...pairwiseRgbDistance);
  const averageHueDistance = getAverage(pairwiseHueDistance);
  const saturationValues = hslValues.map((color) => color.saturation);
  const saturationRange =
    saturationValues.length === 0
      ? 0
      : Math.max(...saturationValues) - Math.min(...saturationValues);
  const muddyCount = hslValues.filter(
    (color) =>
      color.saturation < 18 && color.lightness > 22 && color.lightness < 58
  ).length;
  const neonCount = hslValues.filter(
    (color) =>
      color.saturation > 88 && color.lightness > 42 && color.lightness < 68
  ).length;
  const toneIssueRatio =
    hslValues.length === 0 ? 1 : (muddyCount + neonCount) / hslValues.length;
  const contrastScore = clamp(((averageContrast - 1) / 6) * 100, 0, 100);
  const hueBalanceScore =
    saturatedHues.length <= 1
      ? 55
      : clamp((averageHueDistance / 90) * 100, 0, 100);
  const saturationSpreadScore = clamp(
    100 - Math.abs(saturationRange - 45),
    0,
    100
  );
  const duplicateSimilarityScore = clamp(
    (nearestRgbDistance / 95) * 100,
    0,
    100
  );
  const toneHealthScore = clamp(100 - toneIssueRatio * 100, 0, 100);
  const metrics: PaletteScoreMetric[] = [
    {
      description: `${averageContrast.toFixed(1)} average contrast ratio`,
      key: "contrast",
      label: "Contrast",
      score: Math.round(contrastScore),
    },
    {
      description:
        saturatedHues.length <= 1
          ? "Mostly neutral or monochrome hue set"
          : `${Math.round(averageHueDistance)}° average hue separation`,
      key: "hue-balance",
      label: "Hue balance",
      score: Math.round(hueBalanceScore),
    },
    {
      description: `${Math.round(saturationRange)} point saturation range`,
      key: "saturation-spread",
      label: "Saturation spread",
      score: Math.round(saturationSpreadScore),
    },
    {
      description: `${Math.round(nearestRgbDistance)} nearest RGB distance`,
      key: "duplicate-similarity",
      label: "Duplicate similarity",
      score: Math.round(duplicateSimilarityScore),
    },
    {
      description:
        muddyCount === 0 && neonCount === 0
          ? "No muddy or neon outliers detected"
          : `${muddyCount} muddy, ${neonCount} neon`,
      key: "tone-health",
      label: "Muddy / neon",
      score: Math.round(toneHealthScore),
    },
  ];
  const score = Math.round(
    contrastScore * 0.3 +
      hueBalanceScore * 0.2 +
      saturationSpreadScore * 0.15 +
      duplicateSimilarityScore * 0.2 +
      toneHealthScore * 0.15
  );
  const warnings = [
    contrastScore < 45 ? "Low overall contrast" : null,
    duplicateSimilarityScore < 45 ? "Some colors are very similar" : null,
    muddyCount > 0 ? "Muddy low-saturation midtones detected" : null,
    neonCount > 0 ? "Neon outliers detected" : null,
  ].filter((warning): warning is string => warning !== null);

  return {
    label: getPaletteScoreLabel(score),
    metrics,
    score,
    warnings,
  };
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const normalizedHue = wrapHue(hue);
  const normalizedSaturation = clamp(saturation, 0, 100) / 100;
  const normalizedLightness = clamp(lightness, 0, 100) / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const huePrime = normalizedHue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const m = normalizedLightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

export const getHarmonyColor = (
  baseHex: string,
  mode: ColorHarmonyMode,
  colorIndex: number,
  anchorIndex: number
) => {
  const stepIndex = getHarmonyStepIndex(colorIndex, anchorIndex);

  if (stepIndex === 0) {
    return normalizeHex(baseHex);
  }

  const baseHsl = rgbToHsl(baseHex);

  if (mode === "monochrome") {
    const lightnessOffset =
      MONOCHROME_LIGHTNESS_OFFSETS[
        stepIndex % MONOCHROME_LIGHTNESS_OFFSETS.length
      ];

    return hslToHex(
      baseHsl.hue,
      clamp(baseHsl.saturation + (stepIndex === 0 ? 0 : 6), 8, 92),
      clamp(baseHsl.lightness + lightnessOffset, 12, 88)
    );
  }

  const hueOffsets = HARMONY_HUE_OFFSETS[mode];
  const hueOffset = hueOffsets[stepIndex % hueOffsets.length];
  const lightnessOffset = stepIndex === 0 ? 0 : stepIndex % 2 === 0 ? 6 : -6;

  return hslToHex(
    baseHsl.hue + hueOffset,
    clamp(baseHsl.saturation, 18, 88),
    clamp(baseHsl.lightness + lightnessOffset, 16, 84)
  );
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
