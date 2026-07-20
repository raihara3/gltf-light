"use client";

import Link from "next/link";
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
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <RocketIcon size={22} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>gltf-light</span>
          <span className={styles.brandSubtitle}>オフラインでglbのプレビューと軽量化を</span>
        </span>
      </div>

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
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
        >
          {theme === "light" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        </button>
        <span className={styles.version}>v2.0</span>
        <Link className={styles.legacyLink} href="/legacy">
          Previous version
        </Link>
      </div>
    </header>
  );
}
