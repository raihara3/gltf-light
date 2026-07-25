"use client";

import { useModelStore } from "../../store/modelStore";
import { useThreeStage } from "../../viewer/useThreeStage";
import { Stage } from "../../viewer/Stage";
import { FileDropzone } from "../../components/FileDropzone";
import { Copyright } from "../../components/Copyright";
import { PreviewSidebar } from "./PreviewSidebar";
import styles from "../../styles/page.module.scss";

/**
 * Workspace shown once a model is loaded. Owns the single shared 3D stage so it
 * persists across mode switches, and lays out the preview sidebar + viewer.
 */
export function ModelWorkspace() {
  const bytes = useModelStore((state) => state.originalBytes);
  const stage = useThreeStage(bytes);

  return (
    <>
      <aside className={styles.sidebar}>
        <FileDropzone />
        <PreviewSidebar stage={stage} />
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
