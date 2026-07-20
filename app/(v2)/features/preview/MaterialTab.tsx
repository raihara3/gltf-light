"use client";

import type { StageController } from "../../viewer/useThreeStage";
import { CircleIcon } from "../../icons";
import { TabCard } from "./TabCard";
import styles from "./MaterialTab.module.scss";

const MAP_LABELS: Record<string, string> = {
  map: "baseColor",
  normalMap: "normal",
  roughnessMap: "roughness",
  metalnessMap: "metalness",
  emissiveMap: "emissive",
  aoMap: "ao",
};

/** 見た目: materials with live (preview-only) roughness / metalness sliders. */
export function MaterialTab({ stage }: { stage: StageController }) {
  const { materials, setMaterialParam } = stage;

  return (
    <TabCard Icon={CircleIcon} title="マテリアル">
      <ul className={styles.list}>
        {materials.map((material) => (
          <li key={material.id} className={styles.material}>
            <span className={styles.name}>{material.name}</span>
            {material.maps.length > 0 && (
              <div className={styles.maps}>
                {material.maps.map((map) => (
                  <span key={map} className={styles.mapChip}>
                    {MAP_LABELS[map] ?? map}
                  </span>
                ))}
              </div>
            )}
            <label className={styles.slider}>
              <span className={styles.sliderHead}>
                <span>粗さ (Roughness)</span>
                <span className={styles.value}>{material.roughness.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={material.roughness}
                onChange={(event) => setMaterialParam(material.id, "roughness", Number(event.target.value))}
              />
            </label>
            <label className={styles.slider}>
              <span className={styles.sliderHead}>
                <span>金属感 (Metalness)</span>
                <span className={styles.value}>{material.metalness.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={material.metalness}
                onChange={(event) => setMaterialParam(material.id, "metalness", Number(event.target.value))}
              />
            </label>
          </li>
        ))}
      </ul>
    </TabCard>
  );
}
