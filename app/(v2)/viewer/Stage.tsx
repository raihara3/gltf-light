"use client";

import type { Ref } from "react";
import { ViewerToolbar } from "./ViewerToolbar";
import styles from "./Stage.module.scss";

interface StageProps {
  containerRef: Ref<HTMLDivElement>;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  hasAnimation: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetView: () => void;
}

/** Presentational 3D canvas host. The stage is driven by `useThreeStage`. */
export function Stage({
  containerRef,
  onPointerDown,
  onPointerUp,
  hasAnimation,
  isPlaying,
  onTogglePlay,
  onResetView,
}: StageProps) {
  return (
    <div className={styles.stage}>
      <div
        ref={containerRef}
        className={styles.canvas}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      <ViewerToolbar
        hasAnimation={hasAnimation}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onResetView={onResetView}
      />
    </div>
  );
}
