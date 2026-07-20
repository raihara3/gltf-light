"use client";

import { useState } from "react";
import type { StageController } from "../../viewer/useThreeStage";
import { useUiStore } from "../../store/uiStore";
import { formatFileSize } from "../../lib/formatFileSize";
import { SphereIcon, ZapIcon, ArrowRightIcon } from "../../icons";
import { TabCard } from "./TabCard";
import styles from "./MaterialTab.module.scss";

/** Read-only value bar (Figma Slider): a thin line with a knob at `value` (0–1). */
function ValueBar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.param}>
      <span className={styles.paramHead}>
        <span>{label}</span>
        <span className={styles.value}>{value.toFixed(2)}</span>
      </span>
      <div className={styles.bar}>
        <span className={styles.knob} style={{ left: `${value * 100}%` }} />
      </div>
    </div>
  );
}

/**
 * 見た目: material list. Selecting a material reveals its textures and read-only
 * roughness / metalness bars. Multiple materials can stay open at once.
 */
export function MaterialTab({ stage }: { stage: StageController }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const setMode = useUiStore((state) => state.setMode);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <TabCard Icon={SphereIcon} title="マテリアル">
      <ul className={styles.list}>
        {stage.materials.map((material) => {
          const open = openIds.has(material.id);
          return (
            <li key={material.id}>
              <button
                type="button"
                className={`${styles.row} ${open ? styles.rowActive : ""}`}
                aria-expanded={open}
                onClick={() => toggle(material.id)}
              >
                <span className={styles.headIcon}>
                  <SphereIcon size={14} />
                </span>
                <span className={styles.name}>{material.name}</span>
              </button>
              {open && (
                <div className={styles.details}>
                  {material.textures.length > 0 && (
                    <div className={styles.textureBlock}>
                      <span className={styles.textureHeading}>テクスチャ</span>
                      {material.textures.map((texture, index) => (
                        <div key={`${texture.type}-${index}`} className={styles.texture}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img className={styles.thumb} src={texture.url} alt={texture.type} />
                          <div className={styles.textureMeta}>
                            <span className={styles.textureType}>{texture.type}</span>
                            {texture.name && <span className={styles.textureName}>{texture.name}</span>}
                            {texture.width > 0 && (
                              <span className={styles.textureDim}>
                                {texture.width} × {texture.height} px
                              </span>
                            )}
                            {texture.byteLength > 0 && (
                              <span className={styles.textureSize}>{formatFileSize(texture.byteLength)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ValueBar label="粗さ (Roughness)" value={material.roughness} />
                  <ValueBar label="金属感 (Metalness)" value={material.metalness} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.cta} onClick={() => setMode("optimize")}>
        <ZapIcon size={16} />
        <span className={styles.ctaLabel}>マテリアルの最適化をする</span>
        <ArrowRightIcon size={16} />
      </button>
    </TabCard>
  );
}
