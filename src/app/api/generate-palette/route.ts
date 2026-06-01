import { NextResponse } from "next/server";

import { normalizeHex } from "@/utils";

interface LockedColorInput {
  hex: string;
  index: number;
}

interface GeneratePaletteRequestBody {
  currentPaletteSize?: number;
  description: string;
  lockedColors?: LockedColorInput[];
}

interface ParsedPaletteResponse {
  colors: string[];
}

interface GroqChatCompletionResponse {
  choices: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const MAX_DESCRIPTION_LENGTH = 240;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLockedColorInput = (value: unknown): value is LockedColorInput =>
  isRecord(value) &&
  typeof value.index === "number" &&
  Number.isInteger(value.index) &&
  value.index >= 0 &&
  typeof value.hex === "string" &&
  /^#?[0-9A-F]{6}$/i.test(value.hex.trim());

const isGeneratePaletteRequestBody = (
  value: unknown
): value is GeneratePaletteRequestBody =>
  isRecord(value) &&
  typeof value.description === "string" &&
  (!("currentPaletteSize" in value) ||
    (typeof value.currentPaletteSize === "number" &&
      Number.isInteger(value.currentPaletteSize) &&
      value.currentPaletteSize >= 0 &&
      value.currentPaletteSize <= 8)) &&
  (!("lockedColors" in value) ||
    (Array.isArray(value.lockedColors) &&
      value.lockedColors.every(isLockedColorInput)));

const isParsedPaletteResponse = (
  value: unknown
): value is ParsedPaletteResponse =>
  isRecord(value) &&
  Array.isArray(value.colors) &&
  value.colors.every((color) => typeof color === "string");

const isGroqChatCompletionResponse = (
  value: unknown
): value is GroqChatCompletionResponse =>
  isRecord(value) &&
  Array.isArray(value.choices) &&
  value.choices.every(
    (choice) =>
      isRecord(choice) &&
      (!("message" in choice) ||
        (isRecord(choice.message) &&
          (!("content" in choice.message) ||
            typeof choice.message.content === "string" ||
            choice.message.content === null)))
  );

const extractGroqErrorMessage = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.error)) {
    return "Groq request failed.";
  }

  if (typeof value.error.message === "string" && value.error.message.trim()) {
    return value.error.message;
  }

  return "Groq request failed.";
};

const buildLockedColorSummary = (lockedColors: LockedColorInput[]) =>
  lockedColors.length === 0
    ? "None"
    : lockedColors
        .map((color) => `${color.index}:${normalizeHex(color.hex)}`)
        .join(", ");

const isValidPaletteHex = (value: string) => /^#[0-9A-F]{6}$/i.test(value);

const parsePaletteFromGroqResponse = (value: unknown) => {
  if (isParsedPaletteResponse(value)) {
    return value;
  }

  if (!isGroqChatCompletionResponse(value)) {
    return null;
  }

  const content = value.choices[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    const parsedContent: unknown = JSON.parse(content);

    if (!isParsedPaletteResponse(parsedContent)) {
      return null;
    }

    return parsedContent;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isGeneratePaletteRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          "Expected description, optional currentPaletteSize, and optional lockedColors.",
      },
      { status: 400 }
    );
  }

  const description = body.description.trim();

  if (!description) {
    return NextResponse.json(
      { error: "Description cannot be empty." },
      { status: 400 }
    );
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: "Description is too long." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Groq API key is not configured." },
      { status: 500 }
    );
  }

  const lockedColors = body.lockedColors ?? [];
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const minimumPaletteSize = Math.max(
    2,
    ...lockedColors.map((color) => color.index + 1)
  );
  const currentPaletteSize =
    typeof body.currentPaletteSize === "number" && body.currentPaletteSize > 0
      ? body.currentPaletteSize
      : 5;

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        top_p: 0.95,
        max_completion_tokens: 512,
        messages: [
          {
            role: "system",
            content:
              "You are a senior brand and product color designer. Create expressive, production-usable color palettes from short visual descriptions in any language. Translate the scene into atmosphere, lighting, material, temperature, depth, and accent colors instead of choosing literal object colors only. Prefer sophisticated harmony: one anchor color, supporting colors, a useful neutral or atmospheric color when appropriate, and one memorable accent when the palette needs it. Avoid generic rainbow palettes, muddy low-contrast sets, duplicated colors, pure black, pure white, and colors that differ only slightly. Preserve locked colors exactly at their provided indices and design the remaining colors around them. Return valid JSON only, with this exact shape: {\"colors\":[\"#RRGGBB\"]}.",
          },
          {
            role: "user",
            content: [
              `Description: ${description}`,
              `Current palette size: ${currentPaletteSize}`,
              `Allowed palette size: ${minimumPaletteSize} to 8 colors`,
              `Locked colors: ${buildLockedColorSummary(lockedColors)}`,
              "Choose the number of colors yourself based on the prompt. Do not blindly match the current palette size.",
              "Use 3-4 colors for compact, minimal products or brands with a restrained identity, such as Notion-style palettes.",
              "Use 4-5 colors for visual moods, scenes, and most brand palettes.",
              "Use 5-6 colors for multi-color brands like Google, including core brand hues and a useful neutral only when it improves the palette.",
              "Use 6-8 colors only when the prompt clearly asks for a design system, UI kit, full scale, many accents, or color ramps.",
              "If the prompt asks for shades, tints, gradients, or a monochrome system, return a coherent ramp instead of unrelated hues.",
              "Build the palette left to right as a usable design sequence, not a random swatch list.",
              "For a landscape or mood prompt, include sky/light, terrain/depth, shadow/anchor, and a restrained accent when enough colors are useful.",
              "For a brand or product prompt, include only the essential background, foreground/neutral, primary, secondary, and accent roles that fit that brand.",
              "All returned colors must be distinct #RRGGBB hex colors.",
              "Return no markdown, no comments, no color names, and no keys except colors.",
              "Examples of quality direction:",
              "цветовая палитра notion -> warm off-white, charcoal ink, soft gray, restrained warm accent.",
              "цветовая палитра google -> blue, red, yellow, green, practical neutral.",
              "закат в горах -> deep alpine shadow, muted violet ridge, warm amber sun, dusty rose sky, cool glacier highlight.",
              "киберпанк дождь -> near-black asphalt, electric cyan reflection, magenta sign glow, sodium amber, wet steel blue.",
            ].join("\n"),
          },
        ],
        response_format: {
          type: "json_object",
        },
      }),
    });

    const responseBody: unknown = await groqResponse.json();

    if (!groqResponse.ok) {
      return NextResponse.json(
        { error: extractGroqErrorMessage(responseBody) },
        { status: 502 }
      );
    }

    const parsedPalette = parsePaletteFromGroqResponse(responseBody);

    if (!parsedPalette) {
      return NextResponse.json(
        { error: "Groq returned an invalid palette payload." },
        { status: 502 }
      );
    }

    const colors = parsedPalette.colors.map((color) => normalizeHex(color));

    if (colors.length < minimumPaletteSize || colors.length > 8) {
      return NextResponse.json(
        { error: "Groq returned an unsupported number of colors." },
        { status: 502 }
      );
    }

    if (colors.some((color) => !isValidPaletteHex(color))) {
      return NextResponse.json(
        { error: "Groq returned invalid color values." },
        { status: 502 }
      );
    }

    lockedColors.forEach(({ index, hex }) => {
      if (index >= 0 && index < colors.length) {
        colors[index] = normalizeHex(hex);
      }
    });

    return NextResponse.json({ colors });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Groq request failed.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
