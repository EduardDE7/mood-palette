import { useState } from "react";

import { usePaletteStore } from "@/store/usePaletteStore";
import { normalizeHex, type PaletteRole } from "@/utils";

interface AiPaletteLockedColor {
  index: number;
  hex: string;
}

interface AiPaletteCurrentColor extends AiPaletteLockedColor {
  isLocked: boolean;
  role: string | null;
}

interface GeneratePaletteResponse {
  colors: string[];
}

type AiPaletteMode = "generate" | "refine";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isGeneratePaletteResponse = (
  value: unknown
): value is GeneratePaletteResponse =>
  isRecord(value) && isStringArray(value.colors);

const isValidPaletteHex = (value: string) => /^#?[0-9A-F]{6}$/i.test(value);

const buildLockedColors = (colors: { hex: string; isLocked: boolean }[]) =>
  colors.reduce<AiPaletteLockedColor[]>((lockedColors, color, index) => {
    if (!color.isLocked) {
      return lockedColors;
    }

    lockedColors.push({
      index,
      hex: normalizeHex(color.hex),
    });
    return lockedColors;
  }, []);

const buildCurrentColors = (
  colors: { hex: string; isLocked: boolean; role: string | null }[],
  roles: PaletteRole[]
) =>
  colors.map<AiPaletteCurrentColor>((color, index) => {
    const role = color.role
      ? roles.find((roleDefinition) => roleDefinition.key === color.role)
      : null;

    return {
      index,
      hex: normalizeHex(color.hex),
      isLocked: color.isLocked,
      role: role?.label ?? null,
    };
  });

export const useAiPaletteGeneration = () => {
  const applyGeneratedPalette = usePaletteStore(
    (state) => state.applyGeneratedPalette
  );
  const currentColorCount = usePaletteStore((state) => state.colors.length);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrompt = (value: string) => {
    setPrompt(value);

    if (error) {
      setError(null);
    }
  };

  const requestPalette = async (description: string, mode: AiPaletteMode) => {
    const { colors, paletteRoles } = usePaletteStore.getState();
    const lockedColors = buildLockedColors(colors);
    const currentColors =
      mode === "refine" ? buildCurrentColors(colors, paletteRoles) : undefined;

    if (!description) {
      setError(
        mode === "refine"
          ? "Enter a short refinement command."
          : "Enter a short palette description."
      );
      return;
    }

    if (mode === "refine" && (colors.length < 2 || colors.length > 8)) {
      setError("Create a palette before refining it.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-palette", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          mode,
          currentPaletteSize: colors.length,
          currentColors,
          lockedColors,
        }),
      });

      const body: unknown = await response.json();

      if (!response.ok) {
        const message =
          isRecord(body) && typeof body.error === "string"
            ? body.error
            : "AI palette generation failed.";
        throw new Error(message);
      }

      if (!isGeneratePaletteResponse(body)) {
        throw new Error("AI palette response was invalid.");
      }

      const nextColors = body.colors.map((hex) => normalizeHex(hex));

      if (
        nextColors.length < 2 ||
        nextColors.length > 8 ||
        nextColors.some((hex) => !isValidPaletteHex(hex))
      ) {
        throw new Error("AI palette response did not contain valid colors.");
      }

      applyGeneratedPalette(nextColors);
      setPrompt("");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "AI palette generation failed.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePalette = async () => {
    await requestPalette(prompt.trim(), "generate");
  };

  const refinePalette = async (instruction = prompt.trim()) => {
    await requestPalette(instruction.trim(), "refine");
  };

  return {
    canRefine: currentColorCount >= 2,
    error,
    generatePalette,
    isGenerating,
    prompt,
    refinePalette,
    setPrompt: updatePrompt,
  };
};
