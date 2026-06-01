"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui";
import { useAiPaletteGeneration } from "@/hooks";

interface AiPalettePromptProps {
  onClose: () => void;
}

export const AiPalettePrompt = ({ onClose }: AiPalettePromptProps) => {
  const { error, generatePalette, isGenerating, prompt, setPrompt } =
    useAiPaletteGeneration();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const helperTextId = "ai-palette-helper";

  return (
    <div className="relative w-[min(42rem,calc(100vw-1.5rem))]">
      <div className="ai-glow relative rounded-[1.5rem]">
        <form
          className="glass-card bg-card/90 relative rounded-[1.5rem]"
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
            placeholder="Dream in colors..."
            aria-describedby={helperTextId}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void generatePalette();
              }
            }}
            className="text-foreground placeholder:text-muted-foreground block min-h-32 w-full resize-none border-0 bg-transparent px-4 pt-4 pr-16 pb-10 text-sm transition-colors outline-none disabled:opacity-60"
          />

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
