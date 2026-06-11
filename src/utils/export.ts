import {
  getPaletteTokenName,
  type PaletteRole,
  type PaletteRoleKey,
} from "@/utils/roles";
import { getContrastRatio } from "@/utils/colors";

export type ExportFormat =
  | "css"
  | "tailwind"
  | "json"
  | "tokens"
  | "tailwind-v4"
  | "shadcn";

interface FormatColorsForExportOptions {
  roleDefinitions?: readonly PaletteRole[];
  roles?: Array<PaletteRoleKey | null | undefined>;
  semanticNames?: boolean;
}

interface TokenEntry {
  hex: string;
  name: string;
}

const getReadableForeground = (hex: string) => {
  const blackContrast = getContrastRatio("#000000", hex);
  const whiteContrast = getContrastRatio("#FFFFFF", hex);

  return blackContrast > whiteContrast ? "#000000" : "#FFFFFF";
};

const getTokenEntries = (
  hexes: string[],
  prefix: string,
  options: FormatColorsForExportOptions
): TokenEntry[] => {
  const usedTokenNames = new Map<string, number>();

  return hexes.map((hex, index) => {
    const tokenName = options.semanticNames
      ? getPaletteTokenName(
          options.roles?.[index],
          options.roleDefinitions ?? [],
          index,
          prefix
        )
      : `${prefix}-${index + 1}`;
    const usedCount = usedTokenNames.get(tokenName) ?? 0;
    usedTokenNames.set(tokenName, usedCount + 1);

    return {
      hex: hex.toLowerCase(),
      name: usedCount === 0 ? tokenName : `${tokenName}-${usedCount + 1}`,
    };
  });
};

const getTokenHex = (
  entries: TokenEntry[],
  tokenName: string,
  fallbackIndex: number
) =>
  entries.find((entry) => entry.name === tokenName)?.hex ??
  entries[fallbackIndex]?.hex ??
  entries[0]?.hex ??
  "#000000";

const formatStyleDictionaryTokens = (entries: TokenEntry[]) => {
  const tokens = entries.reduce(
    (acc, entry) => {
      acc.color[entry.name] = {
        type: "color",
        value: entry.hex,
      };
      return acc;
    },
    { color: {} } as { color: Record<string, { type: "color"; value: string }> }
  );

  return JSON.stringify(tokens, null, 2);
};

const formatTailwindV4Theme = (entries: TokenEntry[]) => {
  const vars = entries
    .map((entry) => `  --color-${entry.name}: ${entry.hex};`)
    .join("\n");

  return `@theme {\n${vars}\n}`;
};

const formatShadcnThemeBlock = (entries: TokenEntry[]) => {
  const background = getTokenHex(entries, "background", 0);
  const foreground = getTokenHex(entries, "foreground", 1);
  const muted = getTokenHex(entries, "muted", 2);
  const primary = getTokenHex(entries, "primary", 3);
  const accent = getTokenHex(entries, "accent", 4);
  const destructive = getTokenHex(entries, "danger", 5);
  const border = getTokenHex(entries, "border", 2);
  const variables = {
    background,
    foreground,
    card: background,
    "card-foreground": foreground,
    popover: background,
    "popover-foreground": foreground,
    primary,
    "primary-foreground": getReadableForeground(primary),
    secondary: muted,
    "secondary-foreground": getReadableForeground(muted),
    muted,
    "muted-foreground": getReadableForeground(muted),
    accent,
    "accent-foreground": getReadableForeground(accent),
    destructive,
    "destructive-foreground": getReadableForeground(destructive),
    border,
    input: border,
    ring: primary,
  };
  const vars = Object.entries(variables)
    .map(([name, value]) => `  --${name}: ${value};`)
    .join("\n");

  return `:root {\n${vars}\n}`;
};

export const formatColorsForExport = (
  hexes: string[],
  format: ExportFormat,
  prefix = "color",
  options: FormatColorsForExportOptions = {}
): string => {
  const tokenEntries = getTokenEntries(hexes, prefix, options);

  const getTokenName = (index: number) =>
    tokenEntries[index]?.name ?? `${prefix}-${index + 1}`;

  switch (format) {
    case "css": {
      const vars = hexes
        .map((hex, i) => `  --${getTokenName(i)}: ${hex.toLowerCase()};`)
        .join("\n");
      return `:root {\n${vars}\n}`;
    }
    case "tailwind": {
      const colors = hexes
        .map((hex, i) => `      '${getTokenName(i)}': '${hex.toLowerCase()}',`)
        .join("\n");
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n}`;
    }
    case "json": {
      const obj = hexes.reduce(
        (acc, hex, i) => {
          acc[getTokenName(i)] = hex.toLowerCase();
          return acc;
        },
        {} as Record<string, string>
      );
      return JSON.stringify(obj, null, 2);
    }
    case "tokens":
      return formatStyleDictionaryTokens(tokenEntries);
    case "tailwind-v4":
      return formatTailwindV4Theme(tokenEntries);
    case "shadcn":
      return formatShadcnThemeBlock(tokenEntries);
    default:
      return hexes.join(", ");
  }
};
