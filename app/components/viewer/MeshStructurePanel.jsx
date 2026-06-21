// lib
import { memo, useCallback, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

// states
import {
  detailModeEnabledState,
  meshTreeState,
  selectedMeshUuidState,
} from "../../state/atoms/MeshTree";

// components
import MeshTreeNode from "./MeshTreeNode";

// styles
import styles from "../../styles/components/meshStructure.module.scss";

const TITLE_ID = "mesh-structure-panel-title";

const MeshStructurePanel = () => {
  const meshTree = useRecoilValue(meshTreeState);
  const selectedMeshUuid = useRecoilValue(selectedMeshUuidState);
  const setDetailModeEnabled = useSetRecoilState(detailModeEnabledState);
  const setSelectedMeshUuid = useSetRecoilState(selectedMeshUuidState);

  const handleClose = useCallback(() => {
    setDetailModeEnabled(false);
  }, [setDetailModeEnabled]);

  const handleSelect = useCallback(
    (uuid) => {
      setSelectedMeshUuid((previous) => (previous === uuid ? null : uuid));
    },
    [setSelectedMeshUuid]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDetailModeEnabled(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setDetailModeEnabled]);

  return (
    <section
      className={styles.panel}
      role="region"
      aria-labelledby={TITLE_ID}
    >
      <header className={styles.panelHeader}>
        <h3 id={TITLE_ID} className={styles.panelTitle}>
          Mesh Structure
        </h3>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close Detail Mode"
          type="button"
        >
          ×
        </button>
      </header>
      <div className={styles.treeContainer}>
        {meshTree ? (
          <ul className={styles.tree} role="tree">
            <MeshTreeNode
              node={meshTree}
              selectedUuid={selectedMeshUuid}
              onSelect={handleSelect}
            />
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default memo(MeshStructurePanel);
