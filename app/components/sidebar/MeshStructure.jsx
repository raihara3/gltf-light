// lib
import { Fragment, memo, useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

// states
import {
  detailModeEnabledState,
  meshTreeState,
  selectedMeshUuidState,
} from "../../state/atoms/MeshTree";

// components
import MeshTreeNode from "../viewer/MeshTreeNode";

// utils
import { collectAncestorUuids } from "../../utils/collectAncestorUuids";

// styles
import styles from "../../styles/components/meshStructure.module.scss";

const MeshStructure = () => {
  const meshTree = useRecoilValue(meshTreeState);
  const [selectedMeshUuid, setSelectedMeshUuid] = useRecoilState(
    selectedMeshUuidState
  );
  const [detailModeEnabled, setDetailModeEnabled] = useRecoilState(
    detailModeEnabledState
  );

  const expandedAncestorUuids = useMemo(
    () => collectAncestorUuids(meshTree, selectedMeshUuid),
    [meshTree, selectedMeshUuid]
  );

  const handleSelect = useCallback(
    (uuid) => {
      setSelectedMeshUuid((previous) => (previous === uuid ? null : uuid));
    },
    [setSelectedMeshUuid]
  );

  const handleToggleViewerPicking = useCallback(
    (event) => {
      setDetailModeEnabled(event.target.checked);
    },
    [setDetailModeEnabled]
  );

  return (
    <Fragment>
      <h3 className="title">Mesh Structure</h3>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={detailModeEnabled}
          onChange={handleToggleViewerPicking}
        />
        <span>Click viewer to select</span>
      </label>
      {meshTree ? (
        <ul className={styles.tree} role="tree">
          <MeshTreeNode
            node={meshTree}
            selectedUuid={selectedMeshUuid}
            expandedAncestorUuids={expandedAncestorUuids}
            onSelect={handleSelect}
          />
        </ul>
      ) : null}
    </Fragment>
  );
};

export default memo(MeshStructure);
