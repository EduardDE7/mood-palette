"use client";

import { useMemo, useState } from "react";
import { BarChart3, CreditCard, Search } from "lucide-react";

import type { ColorItem } from "@/store/usePaletteStore";
import {
  COLOR_BLINDNESS_LABELS,
  getContrastColor,
  getContrastRatio,
  getPaletteRoleTokenName,
  simulateColorBlindness,
  type ColorBlindnessMode,
  type PaletteRole,
} from "@/utils";

interface LivePreviewPanelProps {
  colors: ColorItem[];
  roles: PaletteRole[];
}

interface PreviewTokens {
  accent: string;
  background: string;
  danger: string;
  foreground: string;
  muted: string;
  primary: string;
}

const PREVIEW_ROLE_KEYS = [
  "background",
  "foreground",
  "muted",
  "primary",
  "accent",
  "danger",
] as const;

const COLOR_BLINDNESS_MODES: Array<{
  label: string;
  mode: ColorBlindnessMode;
}> = [
  { label: "Normal", mode: "normal" },
  { label: "Deut", mode: "deuteranopia" },
  { label: "Prot", mode: "protanopia" },
  { label: "Trit", mode: "tritanopia" },
];

const getRoleCandidates = (roles: PaletteRole[], targetRole: string) => {
  const exactMatches = roles.filter((role) => role.key === targetRole);
  const labelMatches = roles.filter(
    (role) =>
      role.key !== targetRole && getPaletteRoleTokenName(role) === targetRole
  );

  return [...exactMatches, ...labelMatches];
};

const getAssignedRoleColor = (
  colors: ColorItem[],
  roles: PaletteRole[],
  targetRole: string
) => {
  const candidateRoles = getRoleCandidates(roles, targetRole);

  for (const role of candidateRoles) {
    const color = colors.find((colorItem) => colorItem.role === role.key);

    if (color) {
      return color.hex;
    }
  }

  return null;
};

const getMostContrastingColor = (colors: string[], background: string) =>
  colors.reduce(
    (bestColor, color) =>
      getContrastRatio(color, background) >
      getContrastRatio(bestColor, background)
        ? color
        : bestColor,
    colors[0]
  );

const getPreviewTokens = (
  colors: ColorItem[],
  roles: PaletteRole[]
): PreviewTokens | null => {
  const paletteHexes = colors.map((color) => color.hex);

  if (paletteHexes.length === 0) {
    return null;
  }

  const assignedColors = Object.fromEntries(
    PREVIEW_ROLE_KEYS.map((roleKey) => [
      roleKey,
      getAssignedRoleColor(colors, roles, roleKey),
    ])
  ) as Record<(typeof PREVIEW_ROLE_KEYS)[number], string | null>;
  const background = assignedColors.background ?? paletteHexes[0];
  const foreground =
    assignedColors.foreground ??
    getMostContrastingColor(paletteHexes, background);

  return {
    accent:
      assignedColors.accent ?? paletteHexes[4] ?? paletteHexes[1] ?? foreground,
    background,
    danger:
      assignedColors.danger ?? paletteHexes[5] ?? paletteHexes[2] ?? foreground,
    foreground,
    muted:
      assignedColors.muted ?? paletteHexes[2] ?? paletteHexes[1] ?? foreground,
    primary:
      assignedColors.primary ??
      paletteHexes[3] ??
      paletteHexes[1] ??
      foreground,
  };
};

const mixColor = (firstColor: string, secondColor: string, amount: number) =>
  `color-mix(in srgb, ${firstColor} ${amount}%, ${secondColor})`;

export const LivePreviewPanel = ({ colors, roles }: LivePreviewPanelProps) => {
  const [simulationMode, setSimulationMode] =
    useState<ColorBlindnessMode>("normal");
  const sourceTokens = useMemo(
    () => getPreviewTokens(colors, roles),
    [colors, roles]
  );
  const tokens = useMemo(
    () =>
      sourceTokens
        ? {
            accent: simulateColorBlindness(sourceTokens.accent, simulationMode),
            background: simulateColorBlindness(
              sourceTokens.background,
              simulationMode
            ),
            danger: simulateColorBlindness(sourceTokens.danger, simulationMode),
            foreground: simulateColorBlindness(
              sourceTokens.foreground,
              simulationMode
            ),
            muted: simulateColorBlindness(sourceTokens.muted, simulationMode),
            primary: simulateColorBlindness(
              sourceTokens.primary,
              simulationMode
            ),
          }
        : null,
    [simulationMode, sourceTokens]
  );

  if (!tokens) {
    return null;
  }

  const foregroundOnPrimary = getContrastColor(tokens.primary);
  const foregroundOnAccent = getContrastColor(tokens.accent);
  const foregroundOnDanger = getContrastColor(tokens.danger);
  const mutedSurface = mixColor(tokens.background, tokens.foreground, 88);
  const cardSurface = mixColor(tokens.background, tokens.foreground, 94);
  const borderColor = mixColor(tokens.foreground, tokens.background, 22);
  const chartBars = [
    { color: tokens.primary, height: "62%" },
    { color: tokens.accent, height: "84%" },
    { color: tokens.muted, height: "46%" },
    { color: tokens.danger, height: "68%" },
  ];

  return (
    <section
      className="border-border/80 bg-card/80 relative z-30 w-full border-t px-3 py-3 backdrop-blur-2xl md:absolute md:top-24 md:left-6 md:w-80 md:rounded-2xl md:border md:shadow-2xl"
      aria-label="Live UI palette preview"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-xs font-bold tracking-wide uppercase">
            Live preview
          </h2>
          <p className="text-muted-foreground text-[11px] font-medium">
            {COLOR_BLINDNESS_LABELS[simulationMode]} view
          </p>
        </div>
        <span className="border-border text-muted-foreground inline-flex h-7 w-7 items-center justify-center rounded-full border">
          <CreditCard size={14} />
        </span>
      </div>

      <div
        className="mb-3 grid grid-cols-4 gap-1"
        role="group"
        aria-label="Color blindness simulation"
      >
        {COLOR_BLINDNESS_MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => setSimulationMode(option.mode)}
            aria-pressed={simulationMode === option.mode}
            title={`Preview ${COLOR_BLINDNESS_LABELS[option.mode]}`}
            className={`rounded-full border px-2 py-1 text-[10px] font-bold transition ${
              simulationMode === option.mode
                ? "border-white/70 bg-white/95 text-slate-950"
                : "border-border text-muted-foreground bg-muted/20 hover:bg-muted/30"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="overflow-hidden rounded-2xl border text-xs shadow-2xl"
        style={{
          backgroundColor: tokens.background,
          borderColor,
          color: tokens.foreground,
        }}
      >
        <div className="flex min-h-56">
          <aside
            className="flex w-20 shrink-0 flex-col gap-2 p-3"
            style={{ backgroundColor: mutedSurface }}
          >
            <div
              className="h-6 w-6 rounded-lg"
              style={{ backgroundColor: tokens.primary }}
            />
            <div
              className="mt-2 h-2 rounded-full"
              style={{ backgroundColor: tokens.foreground }}
            />
            <div
              className="h-2 w-9 rounded-full opacity-70"
              style={{ backgroundColor: tokens.foreground }}
            />
            <div
              className="h-2 w-7 rounded-full opacity-50"
              style={{ backgroundColor: tokens.foreground }}
            />
            <div className="mt-auto flex gap-1">
              {[tokens.primary, tokens.accent, tokens.danger].map((color) => (
                <span
                  key={color}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold tracking-wide uppercase opacity-70">
                  Dashboard
                </p>
                <h3 className="text-sm font-bold">Revenue overview</h3>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{
                  backgroundColor: tokens.accent,
                  color: foregroundOnAccent,
                }}
              >
                New
              </span>
            </div>

            <label
              className="mb-3 flex h-9 items-center gap-2 rounded-xl border px-2.5"
              style={{
                backgroundColor: cardSurface,
                borderColor,
              }}
            >
              <Search size={13} className="opacity-60" />
              <span className="opacity-60">Search products</span>
            </label>

            <div
              className="mb-3 rounded-2xl border p-3"
              style={{ backgroundColor: cardSurface, borderColor }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-wide uppercase opacity-60">
                    Active users
                  </p>
                  <p className="text-xl font-bold">12.8k</p>
                </div>
                <BarChart3 size={18} style={{ color: tokens.primary }} />
              </div>
              <div className="flex h-16 items-end gap-2">
                {chartBars.map((bar, barIndex) => (
                  <div
                    key={`${bar.color}-${barIndex}`}
                    className="flex-1 rounded-t-lg"
                    style={{
                      backgroundColor: bar.color,
                      height: bar.height,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <span
                className="rounded-xl px-3 py-2 text-[11px] font-bold"
                style={{
                  backgroundColor: tokens.primary,
                  color: foregroundOnPrimary,
                }}
              >
                Continue
              </span>
              <span
                className="rounded-xl border px-3 py-2 text-[11px] font-bold"
                style={{
                  borderColor: tokens.danger,
                  color: tokens.danger,
                }}
              >
                Delete
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between border-t px-3 py-2"
          style={{ borderColor }}
        >
          <span className="opacity-70">Status</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: tokens.danger,
              color: foregroundOnDanger,
            }}
          >
            Alert
          </span>
        </div>
      </div>
    </section>
  );
};
