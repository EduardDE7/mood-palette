export type PaletteRoleKey = string;

export interface PaletteRole {
  key: PaletteRoleKey;
  label: string;
}

export const DEFAULT_PALETTE_ROLES = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "muted", label: "Muted" },
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "danger", label: "Danger" },
] as const satisfies readonly PaletteRole[];

export const PALETTE_ROLES = DEFAULT_PALETTE_ROLES;

export const NO_PALETTE_ROLE_VALUE = "__no_role__";

export const normalizePaletteRoleLabel = (label: string) =>
  label.trim().replace(/\s+/g, " ");

export const getPaletteRoleByKey = (
  roleKey: PaletteRoleKey | null | undefined,
  roles: readonly PaletteRole[] = DEFAULT_PALETTE_ROLES
): PaletteRole | null => roles.find((role) => role.key === roleKey) ?? null;

export const isPaletteRoleKey = (
  value: string,
  roles: readonly PaletteRole[] = DEFAULT_PALETTE_ROLES
): value is PaletteRoleKey => roles.some((role) => role.key === value);

export const getPaletteRoleTokenName = (role: PaletteRole) => {
  const normalizedLabel = normalizePaletteRoleLabel(role.label).toLowerCase();
  const slug = normalizedLabel
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  const safeSlug = /^\p{N}/u.test(slug) ? `role-${slug}` : slug;

  return safeSlug || role.key;
};

export const getPaletteTokenName = (
  roleKey: PaletteRoleKey | null | undefined,
  roles: readonly PaletteRole[],
  index: number,
  fallbackPrefix = "color"
) => {
  const role = getPaletteRoleByKey(roleKey, roles);

  return role
    ? getPaletteRoleTokenName(role)
    : `${fallbackPrefix}-${index + 1}`;
};
