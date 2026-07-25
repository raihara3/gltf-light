"use client";

import { useModelStore } from "../store/modelStore";
import { useUiStore } from "../store/uiStore";
import { formatFileSize } from "../lib/formatFileSize";
import { FileIcon, ZapIcon, ArrowRightIcon } from "../icons";
import styles from "./ModelSummaryCard.module.scss";

const POLYGON_PLACEHOLDER = "—"; // filled once the glb is parsed (issue 0-6 / #31)

/**
 * Model overview card (Figma "info-box"): file name + copyright, size/polygon
 * chips, and the coral "optimize" CTA. Polygon count and the estimate suffix
 * depend on the 3D parser / pipeline (later issues) and show placeholders here.
 */
export function ModelSummaryCard() {
  const meta = useModelStore((state) => state.meta);
  const setMode = useUiStore((state) => state.setMode);

  if (!meta) {
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <span className={styles.fileIcon}>
          <FileIcon size={14} />
        </span>
        <span className={styles.name} title={meta.name}>
          {meta.name}
        </span>
      </div>

      <div className={styles.dataArea}>
        <div className={styles.data}>
          <span className={styles.dataLabel}>サイズ</span>
          <span className={styles.dataValue}>{formatFileSize(meta.size)}</span>
        </div>
        <div className={styles.data}>
          <span className={styles.dataLabel}>ポリゴン数</span>
          <span className={styles.dataValue}>
            {meta.polygons != null ? meta.polygons.toLocaleString() : POLYGON_PLACEHOLDER}
          </span>
        </div>
      </div>

      <button type="button" className={styles.cta} onClick={() => setMode("optimize")}>
        <ZapIcon size={16} />
        <span className={styles.ctaLabel}>モデルの軽量化をする</span>
        <ArrowRightIcon size={16} />
      </button>
    </div>
  );
}
