"use client";

import type { StageController } from "../../viewer/useThreeStage";
import { useTranslations } from "../../i18n/useTranslations";
import { useOptimizePipeline } from "./useOptimizePipeline";
import { PruneDedupCard } from "./PruneDedupCard";
import { TextureOptimizeCard } from "./TextureOptimizeCard";
import { PolygonReduceCard } from "./PolygonReduceCard";
import { BeforeAfterSummary } from "./BeforeAfterSummary";
import styles from "./OptimizeSidebar.module.scss";

/**
 * Optimize-mode sidebar (Figma node 73-1454). This issue (1-3) delivers the
 * container + the prune/dedup section wired to the Worker pipeline. Texture /
 * polygon sections and the save bar arrive in #35 / #36 / #37.
 */
export function OptimizeSidebar({ stage }: { stage: StageController }) {
  useOptimizePipeline();
  const t = useTranslations();

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.heading}>{t("optimize.heading")}</h2>
      <PruneDedupCard />
      <TextureOptimizeCard stage={stage} />
      <PolygonReduceCard stage={stage} />
      <BeforeAfterSummary />
    </div>
  );
}
