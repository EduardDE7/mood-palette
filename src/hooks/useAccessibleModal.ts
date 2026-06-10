import { useEffect, type RefObject } from "react";

interface UseAccessibleModalParams {
  isOpen: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

export const useAccessibleModal = ({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
}: UseAccessibleModalParams) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialogElement = dialogRef.current;

    if (!dialogElement) {
      return;
    }

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTarget = initialFocusRef?.current ?? dialogElement;
    focusTarget.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogElement.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS_SELECTOR
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (event.shiftKey) {
        if (
          !activeElement ||
          activeElement === firstFocusableElement ||
          !dialogElement.contains(activeElement)
        ) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
        return;
      }

      if (
        !activeElement ||
        activeElement === lastFocusableElement ||
        !dialogElement.contains(activeElement)
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, [dialogRef, initialFocusRef, isOpen, onClose]);
};
