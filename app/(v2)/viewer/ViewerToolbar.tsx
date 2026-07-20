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
  return (
    <div className={styles.toolbar}>
      {hasAnimation && (
        <button
          type="button"
          className={styles.button}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "アニメーションを停止" : "アニメーションを再生"}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
        </button>
      )}
      <button type="button" className={styles.button} onClick={onResetView} aria-label="視点をリセット">
        <RotateIcon size={16} />
      </button>
    </div>
  );
}
