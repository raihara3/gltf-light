"use client";

import { useState } from "react";
import type { StageController } from "../../viewer/useThreeStage";
import { useUiStore } from "../../store/uiStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { formatFileSize } from "../../lib/formatFileSize";
import { SphereIcon, ZapIcon, ArrowRightIcon, TrashIcon, RotateIcon } from "../../icons";
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
 * roughness / metalness bars. Materials and individual texture slots can be
 * marked for deletion (F-10) — non-destructive: the mark drives the optimize
 * pipeline and is fully undoable (toggle again, or リセット), so no confirm
 * dialog is needed.
 */
export function MaterialTab({ stage }: { stage: StageController }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const setMode = useUiStore((state) => state.setMode);
  const deletedMaterials = useOptimizeStore((state) => state.settings.deletedMaterials);
  const deletedTextureSlots = useOptimizeStore((state) => state.settings.deletedTextureSlots);
  const toggleMaterialDeleted = useOptimizeStore((state) => state.toggleMaterialDeleted);
  const toggleTextureSlotDeleted = useOptimizeStore((state) => state.toggleTextureSlotDeleted);

  const isSlotDeleted = (material: string, slot: string) =>
    deletedTextureSlots.some((entry) => entry.material === material && entry.slot === slot);

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
          const materialDeleted = deletedMaterials.includes(material.name);
          return (
            <li key={material.id}>
              <div className={`${styles.row} ${open ? styles.rowActive : ""}`}>
                <button
                  type="button"
                  className={`${styles.expand} ${materialDeleted ? styles.deleted : ""}`}
                  aria-expanded={open}
                  onClick={() => toggle(material.id)}
                >
                  <span className={styles.headIcon}>
                    <SphereIcon size={14} />
                  </span>
                  <span className={styles.name}>{material.name}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.action} ${materialDeleted ? styles.restore : styles.danger}`}
                  aria-label={materialDeleted ? `${material.name} を戻す` : `${material.name} を削除`}
                  aria-pressed={materialDeleted}
                  onClick={() => toggleMaterialDeleted(material.name)}
                >
                  {materialDeleted ? <RotateIcon size={14} /> : <TrashIcon size={14} />}
                </button>
              </div>
              {open && (
                <div className={styles.details}>
                  {material.textures.length > 0 && (
                    <div className={styles.textureBlock}>
                      <span className={styles.textureHeading}>テクスチャ</span>
                      {material.textures.map((texture, index) => {
                        const slotDeleted =
                          materialDeleted || isSlotDeleted(material.name, texture.type);
                        return (
                          <div
                            key={`${texture.type}-${index}`}
                            className={`${styles.texture} ${slotDeleted ? styles.deleted : ""}`}
                          >
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
                            {!materialDeleted && (
                              <button
                                type="button"
                                className={`${styles.action} ${
                                  isSlotDeleted(material.name, texture.type) ? styles.restore : styles.danger
                                }`}
                                aria-label={
                                  isSlotDeleted(material.name, texture.type)
                                    ? `${texture.type} を戻す`
                                    : `${texture.type} を削除`
                                }
                                aria-pressed={isSlotDeleted(material.name, texture.type)}
                                onClick={() =>
                                  toggleTextureSlotDeleted({ material: material.name, slot: texture.type })
                                }
                              >
                                {isSlotDeleted(material.name, texture.type) ? (
                                  <RotateIcon size={14} />
                                ) : (
                                  <TrashIcon size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
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
