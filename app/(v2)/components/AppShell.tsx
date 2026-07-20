"use client";

import { useEffect } from "react";
import { useUiStore } from "../store/uiStore";

/**
 * Client wrapper for the whole v2 tree. Owns the `[data-app="v2"]` scope and the
 * `data-theme` attribute that drives the token overrides. The persisted store is
 * rehydrated after mount (see `skipHydration` in uiStore) so the first client
 * render matches the server render on the defaults.
 */
export function AppShell({
  children,
  fontClassName,
}: {
  children: React.ReactNode;
  fontClassName: string;
}) {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    void useUiStore.persist.rehydrate();
  }, []);

  return (
    <div data-app="v2" data-theme={theme} className={fontClassName}>
      {children}
    </div>
  );
}
