"use client";

import { useMemo, useState } from "react";
import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { useThreeStage } from "../../viewer/useThreeStage";
import { Switch } from "../../components/ui/Switch";
import { formatFileSize } from "../../lib/formatFileSize";
import { ImageIcon, CheckIcon, TrashIcon, RotateIcon } from "../../icons";
import card from "./OptimizeCard.module.scss";
import styles from "./TextureOptimizeCard.module.scss";

type StageController = ReturnType<typeof useThreeStage>;

type Resolution = 512 | 1024 | 2048;

const OPTIONS: { value: Resolution; sub: string }[] = [
  { value: 512, sub: "最軽量" },
  { value: 1024, sub: "おすすめ" },
  { value: 2048, sub: "高品質" },
];

/** Resolution offered per-texture (only downscales below the current edge). */
const RESOLUTIONS: Resolution[] = [2048, 1024, 512];
/** Recommended per-texture target (matches the global "おすすめ" chip). */
const RECOMMENDED: Resolution = 1024;

interface TextureRow {
  name: string;
  type: string;
  url: string;
  width: number;
  height: number;
  byteLength: number;
}

/** Unique textures across all materials, keyed by name (the pipeline's key). */
function collectTextures(stage: StageController): TextureRow[] {
  const seen = new Map<string, TextureRow>();
  for (const material of stage.materials) {
    for (const texture of material.textures) {
      if (!texture.name || seen.has(texture.name)) {
        continue;
      }
      seen.set(texture.name, {
        name: texture.name,
        type: texture.type,
        url: texture.url,
        width: texture.width,
        height: texture.height,
        byteLength: texture.byteLength,
      });
    }
  }
  return Array.from(seen.values());
}

/** Per-texture row: resolution dropdown + a non-destructive delete toggle. */
function TextureRowItem({ texture }: { texture: TextureRow }) {
  const override = useOptimizeStore((state) => state.settings.textureOverrides[texture.name]);
  const setTextureOverride = useOptimizeStore((state) => state.setTextureOverride);
  const deleted = useOptimizeStore((state) => state.settings.deletedTextures.includes(texture.name));
  const toggleTextureDeleted = useOptimizeStore((state) => state.toggleTextureDeleted);

  const longest = Math.max(texture.width, texture.height);
  const choices = RESOLUTIONS.filter((resolution) => resolution < longest);

  return (
    <div className={`${styles.textureRow} ${deleted ? styles.deleted : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.thumb} src={texture.url} alt={texture.type} />
      <div className={styles.textureMeta}>
        <span className={styles.textureType}>{texture.type}</span>
        <span className={styles.textureName}>{texture.name}</span>
        <span className={styles.textureDim}>
          {texture.width} × {texture.height} px
        </span>
        {texture.byteLength > 0 && (
          <span className={styles.textureSize}>{formatFileSize(texture.byteLength)}</span>
        )}
      </div>
      <div className={styles.rowControls}>
        <button
          type="button"
          className={`${styles.action} ${deleted ? styles.restore : styles.danger}`}
          aria-label={deleted ? `${texture.name} を戻す` : `${texture.name} を削除`}
          aria-pressed={deleted}
          onClick={() => toggleTextureDeleted(texture.name)}
        >
          {deleted ? <RotateIcon size={14} /> : <TrashIcon size={14} />}
        </button>
        <div className={styles.selectWrap}>
          <select
            className={styles.select}
            aria-label={`${texture.name} の解像度`}
            value={override ?? "keep"}
            onChange={(event) =>
              setTextureOverride(
                texture.name,
                event.target.value === "keep" ? null : Number(event.target.value)
              )
            }
            disabled={deleted || choices.length === 0}
          >
            <option value="keep">変更なし</option>
            {choices.map((resolution) => (
              <option key={resolution} value={resolution}>
                {resolution === RECOMMENDED ? `${resolution}（おすすめ）` : resolution}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/** テクスチャの最適化: bulk downscale, with an optional per-texture ("個別で設定する") mode. */
export function TextureOptimizeCard({ stage }: { stage: StageController }) {
  const maxTextureSize = useModelStore((state) => state.meta?.maxTextureSize);
  const textureMaxSize = useOptimizeStore((state) => state.settings.textureMaxSize);
  const perTexture = useOptimizeStore((state) => state.settings.perTexture);
  const setSettings = useOptimizeStore((state) => state.setSettings);

  const textures = useMemo(() => collectTextures(stage), [stage.materials]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const togglePerTexture = (on: boolean) => {
    if (!on) {
      setSettings({ perTexture: false });
      return;
    }
    // Seed each texture with a sensible default: downscale the ones larger than
    // the recommended edge, keep the rest ("変更なし").
    const textureOverrides: Record<string, number> = {};
    for (const texture of textures) {
      if (Math.max(texture.width, texture.height) > RECOMMENDED) {
        textureOverrides[texture.name] = RECOMMENDED;
      }
    }
    setSettings({ perTexture: true, textureOverrides });
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

          {textures.length > 0 && (
            <button
              type="button"
              className={styles.individualToggle}
              role="checkbox"
              aria-checked={perTexture}
              onClick={() => togglePerTexture(!perTexture)}
            >
              <span className={`${styles.check} ${perTexture ? styles.checkOn : ""}`}>
                {perTexture && <CheckIcon size={10} />}
              </span>
              <span className={styles.individualLabel}>個別で設定する</span>
            </button>
          )}

          {perTexture && textures.length > 0 ? (
            <div className={styles.textureList}>
              {textures.map((texture) => (
                <TextureRowItem key={texture.name} texture={texture} />
              ))}
            </div>
          ) : (
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
          )}
        </>
      )}
    </div>
  );
}
