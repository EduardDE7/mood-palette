export type ExportFormat = "css" | "tailwind" | "json";

export const formatColorsForExport = (
  hexes: string[],
  format: ExportFormat,
  prefix = "color"
): string => {
  switch (format) {
    case "css": {
      const vars = hexes
        .map((hex, i) => `  --${prefix}-${i + 1}: ${hex.toLowerCase()};`)
        .join("\n");
      return `:root {\n${vars}\n}`;
    }
    case "tailwind": {
      const colors = hexes
        .map((hex, i) => `      '${prefix}-${i + 1}': '${hex.toLowerCase()}',`)
        .join("\n");
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n}`;
    }
    case "json": {
      const obj = hexes.reduce(
        (acc, hex, i) => {
          acc[`${prefix}-${i + 1}`] = hex.toLowerCase();
          return acc;
        },
        {} as Record<string, string>
      );
      return JSON.stringify(obj, null, 2);
    }
    default:
      return hexes.join(", ");
  }
};
