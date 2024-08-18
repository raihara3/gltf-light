// lib
import { memo, useRef, useEffect } from 'react';
import { useRecoilState } from 'recoil';

// states
import { filePathState, animationsState, polygonCountState } from "../state/atoms/Upload3DModelAtom";

// classes
import GLTFModel from "../classes/GLTFModel";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = () => {
  const gltfModelRef = useRef(new GLTFModel());

  const [filePath, _] = useRecoilState(filePathState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [polygonCount, setPolygonCount] = useRecoilState(polygonCountState);

  useEffect(() => {
    if(!filePath) return;
    gltfModelRef.current.load(filePath).then(() => {
      setAnimations(gltfModelRef.current.getAnimations());
      setPolygonCount(gltfModelRef.current.getPolygonCount());
    })
  }, [filePath])

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