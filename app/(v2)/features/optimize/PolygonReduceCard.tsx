"use client";

import { useEffect, useState } from "react";
import type { StageController } from "../../viewer/useThreeStage";
import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { Switch } from "../../components/ui/Switch";
import { LayersIcon, CheckIcon } from "../../icons";
import card from "./OptimizeCard.module.scss";
import styles from "./PolygonReduceCard.module.scss";

const MAX_REDUCTION = 90; // %

/** ポリゴンの削減: meshoptimizer simplify. OFF by default; explicit action only. */
export function PolygonReduceCard({ stage }: { stage: StageController }) {
  const originalPolygons = useModelStore((state) => state.meta?.polygons);
  const reduce = useOptimizeStore((state) => state.settings.reduce);
  const setSettings = useOptimizeStore((state) => state.setSettings);
  const resultPolygons = useOptimizeStore((state) => state.result?.stats?.polygons);
  const [wireframe, setWireframe] = useState(false);

  const enabled = reduce.enabled;
  const reductionPct = Math.round((1 - reduce.ratio) * 100);
  const trackPct = (reductionPct / MAX_REDUCTION) * 100;

  // Always clear the wireframe overlay when the card unmounts.
  useEffect(() => () => stage.setWireframe(false), [stage]);
  // Turn the wireframe off if reduction is disabled.
  useEffect(() => {
    if (!enabled && wireframe) {
      setWireframe(false);
      stage.setWireframe(false);
    }
  }, [enabled, wireframe, stage]);

  const toggleEnabled = (on: boolean) => setSettings({ reduce: { ...reduce, enabled: on } });
  const setReduction = (pct: number) => setSettings({ reduce: { ...reduce, ratio: 1 - pct / 100 } });
  const toggleWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    stage.setWireframe(next);
  };

  return (
    <div className={card.card}>
      <div className={card.sectionTitle}>
        <span className={card.icon}>
          <LayersIcon size={14} />
        </span>
        <span className={card.label}>ポリゴンの削減</span>
        <Switch checked={enabled} onChange={toggleEnabled} label="ポリゴンの削減" />
      </div>
      <p className={card.text}>面の数を減らして軽くします（既定はオフ）。</p>
      <p className={styles.warning}>※形やアニメーションが崩れる場合があります</p>

      {enabled && (
        <>
          <div className={styles.slider}>
            <span className={styles.sliderHead}>
              <span>削減率</span>
              <span className={styles.value}>{reductionPct}%</span>
            </span>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${trackPct}%` }} />
              <span className={styles.knob} style={{ left: `${trackPct}%` }} />
              <input
                type="range"
                className={styles.input}
                min={0}
                max={MAX_REDUCTION}
                step={5}
                value={reductionPct}
                onChange={(event) => setReduction(Number(event.target.value))}
                aria-label="削減率"
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.wireframeToggle}
            aria-pressed={wireframe}
            onClick={toggleWireframe}
          >
            <span className={`${styles.check} ${wireframe ? styles.checkOn : ""}`} aria-hidden="true">
              {wireframe && <CheckIcon size={9} />}
            </span>
            <span className={styles.wireframeLabel}>ワイヤーフレームで確認</span>
          </button>

          <div className={card.dataArea}>
            <div className={card.data}>
              <span className={card.dataLabel}>ポリゴン数</span>
              <span className={card.dataValue}>
                {(resultPolygons ?? originalPolygons ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
