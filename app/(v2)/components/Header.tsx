"use client";

import { useModelStore } from "../store/modelStore";
import { useUiStore, type Mode } from "../store/uiStore";
import {
  RocketIcon,
  EyeIcon,
  ZapIcon,
  SunIcon,
  MoonIcon,
  type IconProps,
} from "../icons";
import styles from "./Header.module.scss";

const MODE_TABS: { value: Mode; label: string; Icon: (props: IconProps) => React.ReactElement }[] = [
  { value: "preview", label: "プレビュー", Icon: EyeIcon },
  { value: "optimize", label: "軽量化", Icon: ZapIcon },
];

export function Header() {
  const hasModel = useModelStore((state) => state.originalBytes !== null);
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.brandMark}>
          <RocketIcon size={24} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>gltf-light</span>
          <span className={styles.brandSubtitle}>オフラインでglbのプレビューと軽量化を</span>
        </span>
      </div>

      {/* Mode tabs only make sense once a model is loaded. */}
      <div className={styles.center}>
        {hasModel && (
          <div className={styles.modeTabs} role="tablist" aria-label="表示モード">
            {MODE_TABS.map(({ value, label, Icon }) => {
              const isActive = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.modeTab} ${isActive ? styles.modeTabActive : ""}`}
                  onClick={() => setMode(value)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
        >
          {theme === "light" ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </button>
      </div>
    </header>
  );
}
