// lib
import { memo } from 'react';
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
  );
}

export default memo(Viewer);