import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Global keyboard shortcuts for power users
 * 
 * Shortcuts:
 * - Cmd/Ctrl + K: Open command palette (search)
 * - Cmd/Ctrl + U: Upload new quote
 * - Cmd/Ctrl + D: Go to dashboard
 * - Cmd/Ctrl + /: Show keyboard shortcuts help
 * - Escape: Close modals/dialogs
 */

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      {
        key: "k",
        ctrl: true,
        meta: true,
        action: () => {
          // Focus search input if exists
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        },
        description: "Focus search",
      },
      {
        key: "u",
        ctrl: true,
        meta: true,
        action: () => {
          setLocation("/quote/upload");
        },
        description: "Upload quote",
      },
      {
        key: "d",
        ctrl: true,
        meta: true,
        action: () => {
          setLocation("/dashboard");
        },
        description: "Go to dashboard",
      },
      {
        key: "/",
        ctrl: true,
        meta: true,
        action: () => {
          showShortcutsHelp();
        },
        description: "Show keyboard shortcuts",
      },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : true;
        const metaMatches = shortcut.meta ? modifierKey : true;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setLocation]);
}

function showShortcutsHelp() {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcuts = [
    { keys: `${modKey} + K`, description: "Focus search" },
    { keys: `${modKey} + U`, description: "Upload quote" },
    { keys: `${modKey} + D`, description: "Go to dashboard" },
    { keys: `${modKey} + /`, description: "Show this help" },
    { keys: "Esc", description: "Close dialogs" },
  ];

  const helpText = shortcuts
    .map((s) => `${s.keys.padEnd(15)} ${s.description}`)
    .join("\n");

  alert(`Keyboard Shortcuts:\n\n${helpText}`);
}

/**
 * Hook for component-specific keyboard shortcuts
 */
export function useComponentShortcuts(shortcuts: Omit<ShortcutConfig, "description">[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : true;
        const metaMatches = shortcut.meta ? modifierKey : true;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
