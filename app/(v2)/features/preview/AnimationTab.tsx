"use client";

import type { StageController } from "../../viewer/useThreeStage";
import { FilmIcon, PlayIcon, PauseIcon } from "../../icons";
import { TabCard } from "./TabCard";
import styles from "./AnimationTab.module.scss";

const FPS = 30;

function formatClip(duration: number): string {
  return `${Math.round(duration * FPS)}f / ${duration.toFixed(1)}s @${FPS}fps`;
}

/** 動き: animation clip list (toggle which play) + player (play/pause + seek). */
export function AnimationTab({ stage }: { stage: StageController }) {
  const { animations, activeClips, isPlaying, currentTime, duration, togglePlay, toggleClip, seek } = stage;
  const clampedTime = duration > 0 ? Math.min(currentTime % duration || 0, duration) : 0;

  return (
    <TabCard Icon={FilmIcon} title="アニメーション">
      <ul className={styles.list}>
        {animations.map((clip) => {
          const checked = activeClips.includes(clip.name);
          return (
            <li key={clip.name}>
              <button
                type="button"
                className={styles.row}
                aria-pressed={checked}
                onClick={() => toggleClip(clip.name)}
              >
                <span className={`${styles.check} ${checked ? styles.checkOn : ""}`} aria-hidden="true" />
                <span className={styles.name}>{clip.name}</span>
                <span className={styles.duration}>{formatClip(clip.duration)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.player}>
        <button
          type="button"
          className={styles.playButton}
          onClick={togglePlay}
          aria-label={isPlaying ? "停止" : "再生"}
        >
          {isPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
        </button>
        <div className={styles.time}>
          <input
            type="range"
            className={styles.seek}
            min={0}
            max={duration || 0}
            step={0.01}
            value={clampedTime}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="再生位置"
          />
          <span className={styles.timeLabel}>
            {clampedTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
      </div>
    </TabCard>
  );
}
