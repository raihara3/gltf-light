"use client";

import { useModelStore } from "../store/modelStore";
import { formatFileSize } from "../lib/formatFileSize";
import { FileIcon } from "../icons";
import styles from "./ModelSummary.module.scss";

/**
 * Minimal loaded-model summary (name + size) shown once a glb is in the store.
 * The full summary card (polygons + optimize CTA) and 3D preview arrive in
 * later issues; this issue only proves the store data flow.
 */
export function ModelSummary() {
  const meta = useModelStore((state) => state.meta);
  const clearModel = useModelStore((state) => state.clearModel);

  if (!meta) {
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.icon}>
          <FileIcon size={14} />
        </span>
        <span className={styles.name} title={meta.name}>
          {meta.name}
        </span>
      </div>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>サイズ</dt>
          <dd className={styles.statValue}>{formatFileSize(meta.size)}</dd>
        </div>
      </dl>
      <button type="button" className={styles.clear} onClick={clearModel}>
        別のモデルを選択
      </button>
    </div>
  );
}
