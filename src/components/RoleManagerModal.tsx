"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui";
import { useAccessibleModal } from "@/hooks";
import { usePaletteStore } from "@/store/usePaletteStore";
import { normalizePaletteRoleLabel } from "@/utils";

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_ROLE_LABEL_LENGTH = 28;

export const RoleManagerModal = ({
  isOpen,
  onClose,
}: RoleManagerModalProps) => {
  const paletteRoles = usePaletteStore((state) => state.paletteRoles);
  const createPaletteRole = usePaletteStore((state) => state.createPaletteRole);
  const renamePaletteRole = usePaletteStore((state) => state.renamePaletteRole);
  const deletePaletteRole = usePaletteStore((state) => state.deletePaletteRole);

  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const portalContainer =
    typeof document === "undefined" ? null : document.body;

  const handleClose = useCallback(() => {
    setStatusMessage("");
    onClose();
  }, [onClose]);

  useAccessibleModal({
    isOpen,
    onClose: handleClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const roleLabelExists = (label: string, ignoredRoleKey?: string) =>
    paletteRoles.some(
      (role) =>
        role.key !== ignoredRoleKey &&
        normalizePaletteRoleLabel(role.label).toLocaleLowerCase() ===
          label.toLocaleLowerCase()
    );

  const commitRename = (roleKey: string, label: string) => {
    const normalizedLabel = normalizePaletteRoleLabel(label).slice(
      0,
      MAX_ROLE_LABEL_LENGTH
    );
    const role = paletteRoles.find(
      (currentRole) => currentRole.key === roleKey
    );

    if (!normalizedLabel) {
      setStatusMessage("Role name cannot be empty.");
      return false;
    }

    if (roleLabelExists(normalizedLabel, roleKey)) {
      setStatusMessage("Role name already exists.");
      return false;
    }

    if (role?.label === normalizedLabel) {
      return true;
    }

    renamePaletteRole(roleKey, normalizedLabel);
    setStatusMessage("Role renamed.");
    return true;
  };

  const handleRenameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    roleLabel: string
  ) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      event.currentTarget.value = roleLabel;
      event.currentTarget.blur();
    }
  };

  const handleCreateRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLabel = normalizePaletteRoleLabel(newRoleLabel).slice(
      0,
      MAX_ROLE_LABEL_LENGTH
    );

    if (!normalizedLabel) {
      setStatusMessage("Role name cannot be empty.");
      return;
    }

    if (roleLabelExists(normalizedLabel)) {
      setStatusMessage("Role name already exists.");
      return;
    }

    const createdRole = createPaletteRole(normalizedLabel);

    if (!createdRole) {
      setStatusMessage("Role could not be created.");
      return;
    }

    setNewRoleLabel("");
    setStatusMessage("Role created.");
  };

  if (!portalContainer) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/20 p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="glass-card max-h-[calc(100vh-2rem)] w-[90vw] max-w-md overflow-hidden rounded-3xl p-4 shadow-2xl sm:p-6"
          >
            <p id={descriptionId} className="sr-only">
              Rename palette roles or create a new role. Press Escape to close
              this modal.
            </p>

            <div className="text-foreground mb-5 flex items-center justify-between gap-3 drop-shadow-md">
              <h2
                id={titleId}
                className="text-lg font-bold tracking-tight sm:text-2xl"
              >
                Palette Roles
              </h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                round
                onClick={handleClose}
                title="Close role manager"
                aria-label="Close role manager"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-2">
              {paletteRoles.map((role) => (
                <div key={role.key} className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`role-name-${role.key}`}>
                    Rename {role.label}
                  </label>
                  <input
                    id={`role-name-${role.key}`}
                    key={`${role.key}-${role.label}`}
                    defaultValue={role.label}
                    maxLength={MAX_ROLE_LABEL_LENGTH}
                    onBlur={(event) => {
                      const isValid = commitRename(
                        role.key,
                        event.currentTarget.value
                      );

                      if (!isValid) {
                        event.currentTarget.value = role.label;
                      }
                    }}
                    onKeyDown={(event) =>
                      handleRenameKeyDown(event, role.label)
                    }
                    className="border-border bg-muted/20 text-foreground focus-visible:ring-ring h-10 min-w-0 flex-1 rounded-2xl border px-3 text-sm font-medium transition outline-none focus-visible:ring-2"
                  />
                  <Button
                    variant="danger"
                    size="icon"
                    round
                    onClick={() => {
                      deletePaletteRole(role.key);
                      setStatusMessage("Role deleted.");
                    }}
                    title={`Delete ${role.label}`}
                    aria-label={`Delete ${role.label}`}
                    className="h-10 w-10 shrink-0"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCreateRole}
              className="border-border/80 mt-5 flex gap-2 border-t pt-4"
            >
              <label className="sr-only" htmlFor="new-role-name">
                New role name
              </label>
              <input
                id="new-role-name"
                value={newRoleLabel}
                maxLength={MAX_ROLE_LABEL_LENGTH}
                onChange={(event) => setNewRoleLabel(event.target.value)}
                placeholder="New role"
                className="border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 min-w-0 flex-1 rounded-2xl border px-3 text-sm font-medium transition outline-none focus-visible:ring-2"
              />
              <Button
                type="submit"
                variant="white"
                size="icon"
                round
                title="Create role"
                aria-label="Create role"
                className="h-10 w-10"
              >
                <Plus size={18} />
              </Button>
            </form>

            <p role="status" aria-live="polite" className="sr-only">
              {statusMessage}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalContainer
  );
};
