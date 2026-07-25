"use client";

import { useOptimizeStore } from "../../store/optimizeStore";
import { Switch } from "../../components/ui/Switch";
import { TrashIcon } from "../../icons";
import styles from "./OptimizeCard.module.scss";

/** 未使用データの削除 (prune/dedup) card. */
export function PruneDedupCard() {
  const enabled = useOptimizeStore((state) => state.settings.pruneDedup);
  const setSettings = useOptimizeStore((state) => state.setSettings);
  const status = useOptimizeStore((state) => state.status);
  const unusedRemoved = useOptimizeStore((state) => state.result?.stats?.unusedRemoved);

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <span className={styles.icon}>
          <TrashIcon size={14} />
        </span>
        <span className={styles.label}>未使用データの削除</span>
        <Switch
          checked={enabled}
          onChange={(checked) => setSettings({ pruneDedup: checked })}
          label="未使用データの削除"
        />
      </div>
      <p className={styles.text}>使われていないデータを削除して軽量化します。</p>
      <div className={styles.dataArea}>
        <div className={styles.data}>
          <span className={styles.dataLabel}>未使用データ</span>
          <span className={styles.dataValue}>
            {status === "estimating" ? "…" : (unusedRemoved ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
