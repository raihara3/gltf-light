"use client";

import { useMemo, useState } from "react";
import type { StageController } from "../../viewer/useThreeStage";
import { FilmIcon, SphereIcon, LayersIcon, type IconProps } from "../../icons";
import { AnimationTab } from "./AnimationTab";
import { MaterialTab } from "./MaterialTab";
import { MeshTab } from "./MeshTab";
import styles from "./ContextTabs.module.scss";

type TabKey = "animation" | "material" | "mesh";

const TABS: { key: TabKey; label: string; Icon: (props: IconProps) => React.ReactElement }[] = [
  { key: "animation", label: "アニメーション", Icon: FilmIcon },
  { key: "material", label: "マテリアル", Icon: SphereIcon },
  { key: "mesh", label: "メッシュ", Icon: LayersIcon },
];

/** Contextual preview tabs (Figma preview screen): animation / material / mesh.
 *  Empty tabs are disabled (F-13). */
export function ContextTabs({ stage }: { stage: StageController }) {
  const counts: Record<TabKey, number> = {
    animation: stage.animations.length,
    material: stage.materials.length,
    mesh: stage.meshTree ? stage.meshTree.children.length : 0,
  };

  const firstEnabled = useMemo(
    () => TABS.find((tab) => counts[tab.key] > 0)?.key ?? "mesh",
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counts.animation, counts.material, counts.mesh]
  );
  const [active, setActive] = useState<TabKey | null>(null);
  const activeKey = active && counts[active] > 0 ? active : firstEnabled;

  return (
    <div className={styles.container}>
      <div className={styles.tabs} role="tablist" aria-label="プレビュー情報">
        {TABS.map(({ key, label, Icon }) => {
          const disabled = counts[key] === 0;
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActive(key)}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
      {activeKey === "animation" && <AnimationTab stage={stage} />}
      {activeKey === "material" && <MaterialTab stage={stage} />}
      {activeKey === "mesh" && <MeshTab stage={stage} />}
    </div>
  );
}
