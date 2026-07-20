"use client";

import { useState } from "react";
import type { StageController, MeshNode } from "../../viewer/useThreeStage";
import { LayersIcon } from "../../icons";
import { TabCard } from "./TabCard";
import styles from "./MeshTab.module.scss";

/** モデル: mesh structure tree, click-synced with the viewer selection. */
export function MeshTab({ stage }: { stage: StageController }) {
  const { meshTree, selectedUuid, selectMesh } = stage;

  return (
    <TabCard Icon={LayersIcon} title="メッシュ">
      <ul className={styles.tree} role="tree">
        {meshTree && (
          <TreeNode node={meshTree} depth={0} selectedUuid={selectedUuid} onSelect={selectMesh} />
        )}
      </ul>
    </TabCard>
  );
}

interface TreeNodeProps {
  node: MeshNode;
  depth: number;
  selectedUuid: string | null;
  onSelect: (uuid: string | null) => void;
}

function TreeNode({ node, depth, selectedUuid, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedUuid === node.uuid;

  return (
    <li role="treeitem" aria-selected={isSelected} aria-expanded={hasChildren ? open : undefined}>
      <div
        className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: `calc(${depth} * var(--space-12))` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "折りたたむ" : "展開する"}
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className={styles.toggleSpacer} />
        )}
        <button
          type="button"
          className={styles.label}
          onClick={() => onSelect(isSelected ? null : node.uuid)}
        >
          <span className={styles.name}>{node.name}</span>
          {node.isMesh && <span className={styles.badge}>mesh</span>}
        </button>
      </div>
      {hasChildren && open && (
        <ul role="group" className={styles.group}>
          {node.children.map((child) => (
            <TreeNode
              key={child.uuid}
              node={child}
              depth={depth + 1}
              selectedUuid={selectedUuid}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
