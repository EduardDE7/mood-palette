"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, LoaderCircle, WandSparkles, X } from "lucide-react";

import { Button } from "@/components/ui";
import { useAiPaletteGeneration } from "@/hooks";

interface AiPalettePromptProps {
  onClose: () => void;
}

const REFINEMENT_COMMANDS = [
  { label: "Warmer", instruction: "make it warmer" },
  { label: "More contrast", instruction: "increase contrast" },
  { label: "Premium", instruction: "more premium" },
  { label: "Less saturated", instruction: "less saturated" },
  {
    label: "Primary blue",
    instruction: "make primary blue but keep mood",
  },
] as const;

export const AiPalettePrompt = ({ onClose }: AiPalettePromptProps) => {
  const {
    canRefine,
    error,
    generatePalette,
    isGenerating,
    prompt,
    refinePalette,
    setPrompt,
  } = useAiPaletteGeneration();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const helperTextId = "ai-palette-helper";

  return (
    <div className="relative mb-2 w-[min(42rem,calc(100vw-1.5rem))] sm:mb-0">
      <div className="ai-glow relative rounded-[1.5rem]">
        <form
          className="border-border relative rounded-[1.5rem] border bg-[#1C221D]"
          onSubmit={(event) => {
            event.preventDefault();
            void generatePalette();
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            round
            onClick={onClose}
            title="Close AI palette prompt"
            aria-label="Close AI palette prompt"
            className="absolute top-2 right-3 h-8 w-8"
          >
            <X size={14} />
          </Button>

          <label className="sr-only" htmlFor="ai-palette-prompt">
            Describe the palette you want to generate
          </label>

          <textarea
            ref={textareaRef}
            id="ai-palette-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isGenerating}
            autoComplete="off"
            spellCheck={false}
            rows={3}
            placeholder="Generate with AI"
            aria-describedby={helperTextId}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void generatePalette();
              }
            }}
            className="text-foreground placeholder:text-muted-foreground block min-h-24 w-full resize-none border-0 bg-transparent px-4 pt-4 pr-16 pb-4 text-sm transition-colors outline-none disabled:opacity-60 sm:min-h-32"
          />

          <div className="px-3 pb-14">
            <p className="sr-only">Refine the current palette with AI</p>
            <div className="flex flex-wrap gap-1.5">
              {REFINEMENT_COMMANDS.map((command) => (
                <button
                  key={command.instruction}
                  type="button"
                  onClick={() => void refinePalette(command.instruction)}
                  disabled={isGenerating || !canRefine}
                  title={
                    canRefine
                      ? `Refine current palette: ${command.instruction}`
                      : "Create a palette before refining it"
                  }
                  className="border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground rounded-full border bg-black/10 px-2.5 py-1 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {command.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            round
            disabled={isGenerating || !canRefine || prompt.trim().length === 0}
            onClick={() => void refinePalette()}
            title="Refine the current palette with this instruction"
            aria-label="Refine current palette with this instruction"
            className="absolute bottom-3 left-3 h-9"
          >
            {isGenerating ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <WandSparkles size={14} />
            )}
            <span>Refine</span>
          </Button>

          <Button
            type="submit"
            variant="white"
            size="icon"
            round
            disabled={isGenerating || prompt.trim().length === 0}
            title="Generate a palette from this description"
            aria-label="Generate palette from description"
            className="absolute right-3 bottom-3 h-9 w-9 shrink-0"
          >
            {isGenerating ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </Button>

          {error ? (
            <p id={helperTextId} className="sr-only" role="alert">
              {error}
            </p>
          ) : (
            <p id={helperTextId} className="sr-only">
              Describe a brand, mood, product, or color system.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
