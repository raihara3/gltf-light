"use client";

import { useTranslations } from "../i18n/useTranslations";
import { PlayIcon, PauseIcon, RotateIcon } from "../icons";
import styles from "./ViewerToolbar.module.scss";

interface ViewerToolbarProps {
  hasAnimation: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetView: () => void;
}

/** Minimal in-viewer controls: play/pause (when animated) + reset view. */
export function ViewerToolbar({ hasAnimation, isPlaying, onTogglePlay, onResetView }: ViewerToolbarProps) {
  const t = useTranslations();
  return (
    <div className={styles.toolbar}>
      {hasAnimation && (
        <button
          type="button"
          className={styles.button}
          onClick={onTogglePlay}
          aria-label={isPlaying ? t("toolbar.pauseAnimation") : t("toolbar.playAnimation")}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>
      )}
      <button
        type="button"
        className={styles.button}
        onClick={onResetView}
        aria-label={t("toolbar.resetView")}
      >
        <RotateIcon size={16} />
      </button>
    </div>
  );
}
