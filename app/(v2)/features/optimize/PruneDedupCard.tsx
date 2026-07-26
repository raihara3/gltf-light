"use client";

import { useOptimizeStore } from "../../store/optimizeStore";
import { Switch } from "../../components/ui/Switch";
import { useTranslations } from "../../i18n/useTranslations";
import { TrashIcon } from "../../icons";
import styles from "./OptimizeCard.module.scss";

/** 未使用データの削除 (prune/dedup) card. */
export function PruneDedupCard() {
  const enabled = useOptimizeStore((state) => state.settings.pruneDedup);
  const setSettings = useOptimizeStore((state) => state.setSettings);
  const status = useOptimizeStore((state) => state.status);
  const unusedRemoved = useOptimizeStore((state) => state.result?.stats?.unusedRemoved);
  const t = useTranslations();

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <span className={styles.icon}>
          <TrashIcon size={14} />
        </span>
        <span className={styles.label}>{t("prune.label")}</span>
        <Switch
          checked={enabled}
          onChange={(checked) => setSettings({ pruneDedup: checked })}
          label={t("prune.label")}
        />
      </div>
      <p className={styles.text}>{t("prune.text")}</p>
      <div className={styles.dataArea}>
        <div className={styles.data}>
          <span className={styles.dataLabel}>{t("prune.dataLabel")}</span>
          <span className={styles.dataValue}>
            {status === "estimating" ? "…" : (unusedRemoved ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
