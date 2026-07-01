// lib
import { memo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

// states
import {
  polygonCountState,
  originalPolygonCountState,
  polygonReductionRatioState,
  hasSkinnedMeshState,
  polygonReduceModalOpenState,
} from "../state/atoms/ModelInfo";

// styles
import styles from "../styles/components/polygonReduce.module.scss";

const MAX_REDUCTION_PERCENT = 90;

const PolygonReduceModal = () => {
  const [isOpen, setIsOpen] = useRecoilState(polygonReduceModalOpenState);
  const [reductionRatio, setReductionRatio] = useRecoilState(
    polygonReductionRatioState
  );
  const polygonCount = useRecoilValue(polygonCountState);
  const originalPolygonCount = useRecoilValue(originalPolygonCountState);
  const hasSkinnedMesh = useRecoilValue(hasSkinnedMeshState);

  const reductionPercent = Math.round((1 - reductionRatio) * 100);

  const onChangeReduction = useCallback(
    (event) => {
      const percent = Number(event.target.value);
      setReductionRatio(1 - percent / 100);
    },
    [setReductionRatio]
  );

  const onReset = useCallback(() => {
    setReductionRatio(1);
  }, [setReductionRatio]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContainerHeader}>
        <h3 className={`sub-title`}>Polygon reduce(beta)</h3>
        <button className={`button`} onClick={onClose}>
          close
        </button>
      </div>
      <div className={`note`}>
        {hasSkinnedMesh && (
          <div className={styles.warning}>
            This model is rigged, so its animation may deform after reduction.
          </div>
        )}
        <div style={{ marginBottom: "15px" }}>
          <h4 className={`sub-title`}>Reduction</h4>
          <input
            className={styles.slider}
            type="range"
            min="0"
            max={MAX_REDUCTION_PERCENT}
            step="5"
            value={reductionPercent}
            onChange={onChangeReduction}
          />
          <div className={styles.sliderValue}>{reductionPercent}%</div>
        </div>
        <div className={styles.result}>
          <div>Original: {originalPolygonCount.toLocaleString()}</div>
          <div>Current: {polygonCount.toLocaleString()}</div>
          <div style={{ marginTop: "10px" }}>
            <button className={`button button--light`} onClick={onReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PolygonReduceModal);
