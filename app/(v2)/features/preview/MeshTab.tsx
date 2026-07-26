"use client";

import { useState } from "react";
import type { StageController, MeshNode } from "../../viewer/useThreeStage";
import { useUiStore } from "../../store/uiStore";
import { useTranslations } from "../../i18n/useTranslations";
import { LayersIcon, CubeIcon, CheckIcon, ZapIcon, ArrowRightIcon } from "../../icons";
import { TabCard } from "./TabCard";
import styles from "./MeshTab.module.scss";

interface FlatRow {
  node: MeshNode;
  depth: number;
}

/** Flatten the tree into visible rows, honoring collapsed nodes. */
function flatten(node: MeshNode, collapsed: Set<string>, depth = 0, acc: FlatRow[] = []): FlatRow[] {
  acc.push({ node, depth });
  if (node.children.length > 0 && !collapsed.has(node.uuid)) {
    node.children.forEach((child) => flatten(child, collapsed, depth + 1, acc));
  }
  return acc;
}

/** モデル: mesh structure tree, click-synced with the viewer selection. */
export function MeshTab({ stage }: { stage: StageController }) {
  const { meshTree, selectedUuid, selectMesh, pickingEnabled, setPickingEnabled } = stage;
  const setMode = useUiStore((state) => state.setMode);
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const rows = meshTree ? flatten(meshTree, collapsed) : [];

  const toggleCollapse = (uuid: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });

  return (
    <TabCard Icon={LayersIcon} title={t("mesh.title")}>
      <button
        type="button"
        className={styles.pickToggle}
        aria-pressed={pickingEnabled}
        onClick={() => setPickingEnabled(!pickingEnabled)}
      >
        <span className={`${styles.check} ${pickingEnabled ? styles.checkOn : ""}`} aria-hidden="true">
          {pickingEnabled && <CheckIcon size={9} />}
        </span>
        <span className={styles.pickLabel}>{t("mesh.pickHint")}</span>
      </button>

      <div className={styles.treeWrap}>
        <ul className={styles.tree} role="tree">
          {rows.map(({ node, depth }) => {
            const hasChildren = node.children.length > 0;
            const open = !collapsed.has(node.uuid);
            const isSelected = selectedUuid === node.uuid;
            const NodeIcon = node.isMesh ? CubeIcon : LayersIcon;
            return (
              <li
                key={node.uuid}
                role="treeitem"
                aria-selected={isSelected}
                aria-expanded={hasChildren ? open : undefined}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
                style={{ paddingLeft: `calc(${depth} * var(--space-12))` }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => toggleCollapse(node.uuid)}
                    aria-label={open ? t("mesh.collapse") : t("mesh.expand")}
                  >
                    {open ? "▾" : "▸"}
                  </button>
                ) : (
                  <span className={styles.toggleSpacer} />
                )}
                <button
                  type="button"
                  className={styles.label}
                  onClick={() => selectMesh(isSelected ? null : node.uuid)}
                >
                  <NodeIcon size={12} />
                  <span className={styles.name}>{node.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <button type="button" className={styles.cta} onClick={() => setMode("optimize")}>
        <ZapIcon size={16} />
        <span className={styles.ctaLabel}>{t("mesh.optimizeCta")}</span>
        <ArrowRightIcon size={16} />
      </button>
    </TabCard>
  );
}
