"use client";

import { useState } from "react";
import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { Switch } from "../../components/ui/Switch";
import { ImageIcon } from "../../icons";
import card from "./OptimizeCard.module.scss";
import styles from "./TextureOptimizeCard.module.scss";

type Resolution = 512 | 1024 | 2048;

const OPTIONS: { value: Resolution; sub: string }[] = [
  { value: 512, sub: "最軽量" },
  { value: 1024, sub: "おすすめ" },
  { value: 2048, sub: "高品質" },
];

/** テクスチャの最適化: bulk downscale of every texture map to a chosen max edge. */
export function TextureOptimizeCard() {
  const maxTextureSize = useModelStore((state) => state.meta?.maxTextureSize);
  const textureMaxSize = useOptimizeStore((state) => state.settings.textureMaxSize);
  const setSettings = useOptimizeStore((state) => state.setSettings);

  const enabled = textureMaxSize !== "off";
  const [lastResolution, setLastResolution] = useState<Resolution>(
    typeof textureMaxSize === "number" ? textureMaxSize : 1024
  );
  const selected = enabled ? (textureMaxSize as Resolution) : lastResolution;

  const toggle = (on: boolean) => setSettings({ textureMaxSize: on ? lastResolution : "off" });
  const selectResolution = (value: Resolution) => {
    setLastResolution(value);
    setSettings({ textureMaxSize: value });
  };

  return (
    <div className={card.card}>
      <div className={card.sectionTitle}>
        <span className={card.icon}>
          <ImageIcon size={14} />
        </span>
        <span className={card.label}>テクスチャの最適化</span>
        <Switch checked={enabled} onChange={toggle} label="テクスチャの最適化" />
      </div>
      <p className={card.text}>最大解像度を選ぶだけで、すべての画像をまとめて縮小します。</p>
      <p className={styles.note}>※指定解像度を超えるもののみ調整します</p>

      {enabled && (
        <>
          {maxTextureSize != null && (
            <div className={card.dataArea}>
              <div className={card.data}>
                <span className={card.dataLabel}>現在の最大解像度</span>
                <span className={card.dataValue}>{maxTextureSize.toLocaleString()}</span>
              </div>
            </div>
          )}
          <div className={styles.chips} role="group" aria-label="最大解像度">
            {OPTIONS.map(({ value, sub }) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${selected === value ? styles.chipActive : ""}`}
                aria-pressed={selected === value}
                onClick={() => selectResolution(value)}
              >
                <span className={styles.chipValue}>{value}</span>
                <span className={styles.chipSub}>{sub}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
