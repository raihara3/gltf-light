"use client";

import { useModelStore } from "../store/modelStore";
import { useThreeStage } from "./useThreeStage";
import { ViewerToolbar } from "./ViewerToolbar";
import styles from "./Stage.module.scss";

/** 3D preview of the uploaded glb, driven by the `useThreeStage` hook. */
export function Stage() {
  const bytes = useModelStore((state) => state.originalBytes);
  const {
    containerRef,
    animations,
    isPlaying,
    selectedName,
    onPointerDown,
    onPointerUp,
    togglePlay,
    resetView,
  } = useThreeStage(bytes);

  return (
    <div className={styles.stage}>
      <div
        ref={containerRef}
        className={styles.canvas}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      {selectedName && <span className={styles.selected}>選択中: {selectedName}</span>}
      <ViewerToolbar
        hasAnimation={animations.length > 0}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onResetView={resetView}
      />
    </div>
  );
}
