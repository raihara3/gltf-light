// lib
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

// states
import { selectedMaterialNameState } from "../../state/atoms/ModelInfo";

// hooks
import { useSelectMaterialByName } from "../../hooks/useSelectMaterialByName";

// styles
import styles from "../../styles/components/meshStructure.module.scss";

const MaterialIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const EMPTY_ANCESTOR_SET = new Set();

const MeshTreeNode = ({
  node,
  selectedUuid,
  expandedAncestorUuids = EMPTY_ANCESTOR_SET,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const rowRef = useRef(null);
  const selectedMaterialName = useRecoilValue(selectedMaterialNameState);
  const selectMaterialByName = useSelectMaterialByName();

  const hasChildren = node.children.length > 0;
  const isSelected = selectedUuid === node.uuid;
  const isOnSelectionPath = expandedAncestorUuids.has(node.uuid);

  useEffect(() => {
    if (isOnSelectionPath) {
      setExpanded(true);
    }
  }, [isOnSelectionPath]);

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  const handleSelect = useCallback(() => {
    onSelect(node.uuid);
  }, [node.uuid, onSelect]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(node.uuid);
      }
    },
    [node.uuid, onSelect]
  );

  const toggleExpanded = useCallback((event) => {
    event.stopPropagation();
    setExpanded((previous) => !previous);
  }, []);

  const handleMaterialClick = useCallback(
    (event, materialName) => {
      event.stopPropagation();
      selectMaterialByName(materialName);
    },
    [selectMaterialByName]
  );

  return (
    <li
      className={styles.node}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isSelected}
    >
      <div
        ref={rowRef}
        className={`${styles.nodeRow} ${isSelected ? styles.nodeRowSelected : ""}`}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {hasChildren ? (
          <button
            className={styles.caret}
            onClick={toggleExpanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            type="button"
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className={styles.caretPlaceholder} />
        )}
        <span className={styles.nodeLabel}>{node.name}</span>
        <span className={styles.nodeType}>{node.type}</span>
      </div>
      {node.isMesh && node.materials.length > 0 && (
        <ul className={styles.materialChips}>
          {node.materials.map((material) => {
            const isMaterialSelected = selectedMaterialName === material.name;
            return (
              <li key={material.uuid}>
                <button
                  type="button"
                  className={`${styles.materialChip} ${isMaterialSelected ? styles.materialChipSelected : ""}`}
                  onClick={(event) => handleMaterialClick(event, material.name)}
                  aria-pressed={isMaterialSelected}
                >
                  <MaterialIcon />
                  <span className={styles.materialChipLabel}>{material.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {hasChildren && expanded && (
        <ul className={styles.children} role="group">
          {node.children.map((child) => (
            <MeshTreeNode
              key={child.uuid}
              node={child}
              selectedUuid={selectedUuid}
              expandedAncestorUuids={expandedAncestorUuids}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default memo(MeshTreeNode);
