// lib
import { memo, Fragment } from 'react';
import { useRecoilValue } from 'recoil';

// states
import {
  filePathState,
} from "../state/atoms/Upload3DModelAtom";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = () => {
  const filePath = useRecoilValue(filePathState);
  const currentSelectAnimation = useRecoilValue(currentSelectAnimationState);

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {filePath ? (
        <model-viewer
        class={styles.viewer}
        src={filePath}
        camera-controls
        autoplay
        animation-name={currentSelectAnimation}
        ar
        ar-modes="webxr scene-viewer"
        shadow-intensity="1"
        />
      ) : (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%)" }}>
          Displays warning on using glb in WebAR.
        </div>
      )}
    </div>
  );
}

export default memo(Viewer);