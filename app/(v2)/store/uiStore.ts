import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Top-level app mode. Preview is the default landing (matches legacy usage). */
export type Mode = "preview" | "optimize";

/** Color theme. Light is the default per the approved design. */
export type Theme = "light" | "dark";

/** UI language. `ja` is the default; detected from the browser on first visit. */
export type Locale = "ja" | "en";

interface UiState {
  mode: Mode;
  theme: Theme;
  locale: Locale;
  setMode: (mode: Mode) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

/**
 * UI-only store (mode + theme). Persisted to localStorage so the selected
 * mode and theme survive a reload. `skipHydration` keeps the server render and
 * the first client render on the defaults, then `StoreHydration` rehydrates
 * after mount — this avoids a React hydration mismatch.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mode: "preview",
      theme: "light",
      locale: "ja",
      setMode: (mode) => set({ mode }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((state) => ({ locale: state.locale === "ja" ? "en" : "ja" })),
    }),
    {
      name: "gltf-light-v2-ui",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
