import { useState } from "react";

import { usePaletteStore } from "@/store/usePaletteStore";
import { normalizeHex } from "@/utils";

interface AiPaletteLockedColor {
  index: number;
  hex: string;
}

interface GeneratePaletteResponse {
  colors: string[];
}

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

export const useAiPaletteGeneration = () => {
  const applyGeneratedPalette = usePaletteStore(
    (state) => state.applyGeneratedPalette
  );
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrompt = (value: string) => {
    setPrompt(value);

    if (error) {
      setError(null);
    }
  };

  const generatePalette = async () => {
    const description = prompt.trim();

    if (!description) {
      setError("Enter a short palette description.");
      return;
    }

    const { colors } = usePaletteStore.getState();
    const lockedColors = buildLockedColors(colors);

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
          currentPaletteSize: colors.length,
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

  return {
    error,
    generatePalette,
    isGenerating,
    prompt,
    setPrompt: updatePrompt,
  };
};
