// lib
import { Fragment, memo, useCallback, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = ({ currentResizeTexture }) => {
  const filePath = useRecoilValue(filePathState);
  const currentSelectAnimation = useRecoilValue(currentSelectAnimationState);

  const modelViewerRef = useRef(null);
  const materials = useRef([]);

  useEffect(() => {
    const modelViewer = document.querySelector("model-viewer#viewer");
    modelViewer.addEventListener("load", (e) => {
      materials.current = modelViewer.model.materials;
    });
  }, []);

  useEffect(() => {
    const modelViewer = document.querySelector("model-viewer#viewer");
    materials.current.forEach(async (material) => {
      if (material.name === currentResizeTexture.materialName) {
        const texture = await modelViewer.createTexture(
          currentResizeTexture.src
        );
        material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
      }
    });
  }, [currentResizeTexture]);

  const onSave = useCallback(() => {
    const download = async () => {
      // 現在のシーンのGLBデータをエクスポート
      const modelViewer = document.querySelector("model-viewer#viewer");
      const glTF = await modelViewer.exportScene();
      const file = new File([glTF], "gltf-light.glb");
      const link = document.createElement("a");
      link.download = file.name;
      link.href = URL.createObjectURL(file);
      link.click();
      URL.revokeObjectURL(link.href);
    };
    download();
  }, []);

  return (
    <Fragment>
      <button class={styles.downloadButton} onClick={onSave}>
        Download glTF
      </button>
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
      ></model-viewer>
    </Fragment>
  );
};

export default memo(Viewer);
