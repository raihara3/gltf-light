"use client";

import type { StageController } from "../../viewer/useThreeStage";
import { SphereIcon } from "../../icons";
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

/** 見た目: materials with read-only roughness / metalness value bars. */
export function MaterialTab({ stage }: { stage: StageController }) {
  return (
    <TabCard Icon={SphereIcon} title="マテリアル">
      <ul className={styles.list}>
        {stage.materials.map((material) => (
          <li key={material.id} className={styles.material}>
            <span className={styles.head}>
              <span className={styles.headIcon}>
                <SphereIcon size={14} />
              </span>
              <span className={styles.name}>{material.name}</span>
            </span>
            {material.maps.length > 0 && (
              <div className={styles.maps}>
                {material.maps.map((map) => (
                  <span key={map} className={styles.mapChip}>
                    {MAP_LABELS[map] ?? map}
                  </span>
                ))}
              </div>
            )}
            <ValueBar label="粗さ (Roughness)" value={material.roughness} />
            <ValueBar label="金属感 (Metalness)" value={material.metalness} />
          </li>
        ))}
      </ul>
    </TabCard>
  );
}
