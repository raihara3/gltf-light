// lib
import { memo, useRef, useEffect } from 'react';
import { useRecoilState } from 'recoil';

// states
import {
  filePathState,
  animationsState,
  polygonCountState,
  materialsState,
  texturesState,
} from "../state/atoms/Upload3DModelAtom";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// classes
import GLTFModel from "../classes/GLTFModel";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = () => {
  const gltfModelRef = useRef(new GLTFModel());

  const [filePath, _] = useRecoilState(filePathState);
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [polygonCount, setPolygonCount] = useRecoilState(polygonCountState);
  const [currentSelectAnimation, setCurrentSelectAnimation] = useRecoilState(currentSelectAnimationState);
  const [materials, setMaterials] = useRecoilState(materialsState);
  const [textures, setTextures] = useRecoilState(texturesState);

  useEffect(() => {
    if(!filePath) return;
    gltfModelRef.current.load(filePath).then(() => {
      const animations = gltfModelRef.current.getAnimations()
      setAnimations(animations);
      setCurrentSelectAnimation(animations[0]);
      setPolygonCount(gltfModelRef.current.getPolygonCount());
      setMaterials(gltfModelRef.current.getMaterials())
      setTextures(gltfModelRef.current.getTextures())
    })
  }, [filePath])

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