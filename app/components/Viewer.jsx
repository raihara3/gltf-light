// lib
import { memo } from 'react';
import { useRecoilState } from 'recoil';

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = () => {
  const [filePath, _] = useRecoilState(filePathState);

  return (
    <model-viewer
      class={styles.viewer}
      src={filePath}
      camera-controls
      autoplay
      animation-name={""}
      ar
      ar-modes="webxr scene-viewer"
      shadow-intensity="1"
    />
  );
}

export default memo(Viewer);