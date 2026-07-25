"use client";

import { useOptimizePipeline } from "./useOptimizePipeline";
import { PruneDedupCard } from "./PruneDedupCard";
import styles from "./OptimizeSidebar.module.scss";

/**
 * Optimize-mode sidebar (Figma node 73-1454). This issue (1-3) delivers the
 * container + the prune/dedup section wired to the Worker pipeline. Texture /
 * polygon sections and the save bar arrive in #35 / #36 / #37.
 */
export function OptimizeSidebar() {
  useOptimizePipeline();

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.heading}>軽量化の設定はカスタマイズが可能です</h2>
      <PruneDedupCard />
    </div>
  );
}
