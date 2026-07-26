"use client";

import { useModelStore } from "../store/modelStore";
import { useUiStore, type Mode } from "../store/uiStore";
import { useTranslations } from "../i18n/useTranslations";
import type { MessageKey } from "../i18n/ja";
import { analytics } from "../lib/analytics";
import {
  RocketIcon,
  EyeIcon,
  ZapIcon,
  SunIcon,
  MoonIcon,
  type IconProps,
} from "../icons";
import styles from "./Header.module.scss";

const MODE_TABS: {
  value: Mode;
  labelKey: MessageKey;
  Icon: (props: IconProps) => React.ReactElement;
}[] = [
  { value: "preview", labelKey: "header.preview", Icon: EyeIcon },
  { value: "optimize", labelKey: "header.optimize", Icon: ZapIcon },
];

export function Header() {
  const hasModel = useModelStore((state) => state.originalBytes !== null);
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const locale = useUiStore((state) => state.locale);
  const toggleLocale = useUiStore((state) => state.toggleLocale);
  const t = useTranslations();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.brandMark}>
          <RocketIcon size={24} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>gltf-light</span>
          <span className={styles.brandSubtitle}>{t("header.brandSubtitle")}</span>
        </span>
      </div>

      {/* Mode tabs only make sense once a model is loaded. */}
      <div className={styles.center}>
        {hasModel && (
          <div className={styles.modeTabs} role="tablist" aria-label={t("header.modeTabs")}>
            {MODE_TABS.map(({ value, labelKey, Icon }) => {
              const isActive = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.modeTab} ${isActive ? styles.modeTabActive : ""}`}
                  onClick={() => {
                    if (value === "optimize") {
                      analytics.optimizeTabOpen();
                    }
                    setMode(value);
                  }}
                >
                  <Icon size={14} />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.langToggle}
          onClick={toggleLocale}
          aria-label={t("header.language")}
        >
          {locale === "ja" ? "EN" : "日本語"}
        </button>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === "light" ? t("header.toDark") : t("header.toLight")}
        >
          {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </button>
      </div>
    </header>
  );
}
