"use client";

import { AlertTriangle, CheckCircle2, CircleMinus } from "lucide-react";

import type { ColorItem } from "@/store/usePaletteStore";
import {
  formatContrastRatio,
  getContrastRatio,
  getPaletteRoleTokenName,
  getWcagContrastLevel,
  type PaletteRole,
  type WcagContrastLevel,
} from "@/utils";

interface ContrastCheckerPanelProps {
  colors: ColorItem[];
  roles: PaletteRole[];
}

interface ContrastPairDefinition {
  backgroundRole: string;
  foregroundRole: string;
  label: string;
}

interface RoleAssignment {
  color: ColorItem;
  role: PaletteRole;
}

const CONTRAST_PAIRS: ContrastPairDefinition[] = [
  {
    backgroundRole: "background",
    foregroundRole: "foreground",
    label: "Foreground / Background",
  },
  {
    backgroundRole: "background",
    foregroundRole: "primary",
    label: "Primary / Background",
  },
  {
    backgroundRole: "background",
    foregroundRole: "accent",
    label: "Accent / Background",
  },
];

const WCAG_LEVEL_STYLES: Record<WcagContrastLevel, string> = {
  AAA: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  AA: "border-lime-400/40 bg-lime-400/10 text-lime-200",
  UI: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  Fail: "border-red-400/40 bg-red-400/10 text-red-200",
};

const getWcagLevelLabel = (level: WcagContrastLevel) =>
  level === "UI" ? "UI AA" : level;

const getRoleCandidates = (roles: PaletteRole[], targetRole: string) => {
  const exactMatches = roles.filter((role) => role.key === targetRole);
  const labelMatches = roles.filter(
    (role) =>
      role.key !== targetRole && getPaletteRoleTokenName(role) === targetRole
  );

  return [...exactMatches, ...labelMatches];
};

const getRoleAssignment = (
  colors: ColorItem[],
  roles: PaletteRole[],
  targetRole: string
): RoleAssignment | null => {
  const candidateRoles = getRoleCandidates(roles, targetRole);

  for (const role of candidateRoles) {
    const color = colors.find((colorItem) => colorItem.role === role.key);

    if (color) {
      return { color, role };
    }
  }

  return null;
};

export const ContrastCheckerPanel = ({
  colors,
  roles,
}: ContrastCheckerPanelProps) => {
  const rows = CONTRAST_PAIRS.map((pair) => {
    const foreground = getRoleAssignment(colors, roles, pair.foregroundRole);
    const background = getRoleAssignment(colors, roles, pair.backgroundRole);
    const ratio =
      foreground && background
        ? getContrastRatio(foreground.color.hex, background.color.hex)
        : null;
    const level = ratio === null ? null : getWcagContrastLevel(ratio);

    return {
      ...pair,
      background,
      foreground,
      level,
      ratio,
    };
  });

  const passingCount = rows.filter(
    (row) => row.level === "AA" || row.level === "AAA"
  ).length;

  return (
    <section
      className="border-border/80 bg-card/80 relative z-30 w-full border-t px-3 py-3 backdrop-blur-2xl md:absolute md:bottom-6 md:left-6 md:w-80 md:rounded-2xl md:border md:shadow-2xl"
      aria-label="WCAG contrast checker"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-xs font-bold tracking-wide uppercase">
            Contrast
          </h2>
          <p className="text-muted-foreground text-[11px] font-medium">
            {passingCount}/3 text pairs pass AA
          </p>
        </div>
        <span className="border-border text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
          WCAG
        </span>
      </div>

      <div className="space-y-1.5">
        {rows.map((row) => {
          const level = row.level;
          const canCheck =
            row.foreground !== null &&
            row.background !== null &&
            level !== null;

          return (
            <div
              key={row.label}
              className="bg-muted/20 flex items-center justify-between gap-3 rounded-xl px-2.5 py-2"
            >
              <div className="min-w-0">
                <div className="mb-1 flex min-w-0 items-center gap-1.5">
                  {row.foreground && row.background ? (
                    <>
                      <span
                        className="border-border h-3 w-3 shrink-0 rounded-full border"
                        style={{ backgroundColor: row.foreground.color.hex }}
                      />
                      <span
                        className="border-border h-3 w-3 shrink-0 rounded-full border"
                        style={{ backgroundColor: row.background.color.hex }}
                      />
                    </>
                  ) : (
                    <CircleMinus
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                  )}
                  <p className="text-foreground truncate text-xs font-semibold">
                    {row.foreground?.role.label ?? row.label.split(" / ")[0]} /{" "}
                    {row.background?.role.label ?? row.label.split(" / ")[1]}
                  </p>
                </div>
                <p className="text-muted-foreground text-[11px] font-medium">
                  {row.ratio === null
                    ? "Missing role"
                    : formatContrastRatio(row.ratio)}
                </p>
              </div>

              {canCheck ? (
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${WCAG_LEVEL_STYLES[level]}`}
                >
                  {level === "Fail" ? (
                    <AlertTriangle size={12} />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  {getWcagLevelLabel(level)}
                </span>
              ) : (
                <span className="border-border text-muted-foreground inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase">
                  Missing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
