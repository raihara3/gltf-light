"use client";

import { useModelStore } from "../../store/modelStore";
import { useUiStore } from "../../store/uiStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { useThreeStage } from "../../viewer/useThreeStage";
import { Stage } from "../../viewer/Stage";
import { FileDropzone } from "../../components/FileDropzone";
import { Copyright } from "../../components/Copyright";
import { PreviewSidebar } from "./PreviewSidebar";
import { OptimizeSidebar } from "../optimize/OptimizeSidebar";
import styles from "../../styles/page.module.scss";

/**
 * Workspace shown once a model is loaded. Owns the single shared 3D stage so it
 * persists across mode switches, and lays out the preview sidebar + viewer.
 */
export function ModelWorkspace() {
  const bytes = useModelStore((state) => state.originalBytes);
  const mode = useUiStore((state) => state.mode);
  const resultBytes = useOptimizeStore((state) => state.result?.bytes);
  // In optimize mode, render the optimized result once ready ("check the
  // result"); everywhere else render the original.
  const displayBytes = mode === "optimize" && resultBytes ? resultBytes : bytes;
  const stage = useThreeStage(displayBytes, bytes);

  return (
    <>
      <aside className={styles.sidebar}>
        {mode === "optimize" ? (
          <OptimizeSidebar stage={stage} />
        ) : (
          <>
            <FileDropzone />
            <PreviewSidebar stage={stage} />
          </>
        )}
      </aside>
      <section className={styles.viewer} aria-label="3Dビュー">
        <Stage
          containerRef={stage.containerRef}
          onPointerDown={stage.onPointerDown}
          onPointerUp={stage.onPointerUp}
          hasAnimation={stage.animations.length > 0}
          isPlaying={stage.isPlaying}
          onTogglePlay={stage.togglePlay}
          onResetView={stage.resetView}
        />
        <Copyright />
      </section>
    </>
  );
}
