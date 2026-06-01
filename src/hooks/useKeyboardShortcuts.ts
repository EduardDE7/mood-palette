import { useEffect } from "react";

import { usePaletteStore } from "@/store/usePaletteStore";

const EDITABLE_ELEMENTS =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";
const MODAL_DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';
const BUTTON_SELECTOR = "button";

const shouldIgnoreShortcutTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest(EDITABLE_ELEMENTS));
};

const getButtonFromTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const button = target.closest(BUTTON_SELECTOR);

  return button instanceof HTMLButtonElement ? button : null;
};

const blurButtonFromTarget = (target: EventTarget | null) => {
  getButtonFromTarget(target)?.blur();
};

export const useKeyboardShortcuts = () => {
  const generatePalette = usePaletteStore((s) => s.generatePalette);
  const canRegenerate = usePaletteStore(
    (s) => s.colors.length === 0 || s.colors.some((color) => !color.isLocked)
  );
  const goBackInPaletteHistory = usePaletteStore(
    (s) => s.goBackInPaletteHistory
  );
  const goForwardInPaletteHistory = usePaletteStore(
    (s) => s.goForwardInPaletteHistory
  );
  const paletteHistoryIndex = usePaletteStore((s) => s.paletteHistoryIndex);
  const paletteHistoryLength = usePaletteStore((s) => s.paletteHistory.length);

  const canGoBack = paletteHistoryIndex > 0;
  const canGoForward =
    paletteHistoryIndex >= 0 && paletteHistoryIndex < paletteHistoryLength - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        document.querySelector(MODAL_DIALOG_SELECTOR) ||
        shouldIgnoreShortcutTarget(e.target)
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z") {
        e.preventDefault();
        blurButtonFromTarget(e.target);
        if (canGoBack) {
          goBackInPaletteHistory();
        }
        return;
      }

      if (isMod && e.key === "Z") {
        e.preventDefault();
        blurButtonFromTarget(e.target);
        if (canGoForward) {
          goForwardInPaletteHistory();
        }
        return;
      }

      if (e.code !== "Space") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      blurButtonFromTarget(e.target);

      if (canRegenerate) {
        generatePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [
    canGoBack,
    canGoForward,
    canRegenerate,
    generatePalette,
    goBackInPaletteHistory,
    goForwardInPaletteHistory,
  ]);

  useEffect(() => {
    let pressedButton: HTMLButtonElement | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      pressedButton = getButtonFromTarget(event.target);
    };

    const handlePointerUp = () => {
      pressedButton?.blur();
      pressedButton = null;
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.detail === 0) {
        return;
      }

      blurButtonFromTarget(event.target);
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointerup", handlePointerUp, true);
      window.removeEventListener("click", handleClick);
    };
  }, []);
};
