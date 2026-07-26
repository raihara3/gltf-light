"use client";

import { useModelStore } from "../../store/modelStore";
import { useUiStore } from "../../store/uiStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { useViewerDrop } from "../../hooks/useViewerDrop";
import { useThreeStage } from "../../viewer/useThreeStage";
import { Stage } from "../../viewer/Stage";
import { FileDropzone } from "../../components/FileDropzone";
import { Copyright } from "../../components/Copyright";
import { LegacyLink } from "../../components/LegacyLink";
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
  const { isDragging, dropProps } = useViewerDrop();

  return (
    <>
      <aside className={styles.sidebar}>
        {mode === "optimize" ? (
          <OptimizeSidebar stage={stage} />
        ) : (
          <>
            <FileDropzone />
            <PreviewSidebar stage={stage} />
            {/* Optimize mode's bottom is the save CTA; keep the discreet legacy
                link to preview/empty so it never competes with the main flow. */}
            <LegacyLink />
          </>
        )}
      </aside>
      <section className={styles.viewer} aria-label="3Dビュー" {...dropProps}>
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
        {isDragging && <div className={styles.dropOverlay}>ここに .glb をドロップして差し替え</div>}
      </section>
    </>
  );
}
