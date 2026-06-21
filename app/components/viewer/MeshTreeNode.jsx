// lib
import { memo, useCallback, useEffect, useRef, useState } from "react";

// styles
import styles from "../../styles/components/meshStructure.module.scss";

const MeshTreeNode = ({ node, selectedUuid, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const rowRef = useRef(null);

  const hasChildren = node.children.length > 0;
  const isSelected = selectedUuid === node.uuid;

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
          {node.materials.map((material) => (
            <li key={material.uuid} className={styles.materialChip}>
              {material.name}
            </li>
          ))}
        </ul>
      )}
      {hasChildren && expanded && (
        <ul className={styles.children} role="group">
          {node.children.map((child) => (
            <MeshTreeNode
              key={child.uuid}
              node={child}
              selectedUuid={selectedUuid}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default memo(MeshTreeNode);
