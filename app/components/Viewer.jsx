// lib
import { memo, useCallback, useRef } from 'react';
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

  const modelViewerRef = useRef(null);

  // const onChangeTexture = useCallback(() => {
  //   const viewer = modelViewerRef.current;
  //   if(!viewer) return;
  //   const scene = viewer.model;
  //   console.log(scene)
  //   if(!scene) return
  //   console.log(scene.materials)
  // }, [filePath])
  // onChangeTexture()

  return (
    <model-viewer
      id="viewer"
      ref={modelViewerRef}
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