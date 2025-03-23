// lib
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// styles
import styles from "../styles/components/viewer.module.scss";

const Viewer = ({ currentResizeTexture }) => {
  const filePath = useRecoilValue(filePathState);
  const setFilePath = useSetRecoilState(filePathState);
  const currentSelectAnimation = useRecoilValue(currentSelectAnimationState);
  const [isDragging, setIsDragging] = useState(false);

  const modelViewerRef = useRef(null);
  const materials = useRef([]);
  const viewerContainerRef = useRef(null);

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

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const validExtensions = [".glb", ".gltf"];
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        if (validExtensions.includes(fileExtension)) {
          const url = URL.createObjectURL(file);
          setFilePath(url);
        } else {
          alert("Please upload a glTF or GLB file.");
        }
      }
    },
    [setFilePath]
  );

  return (
    <Fragment>
      <button className={styles.downloadButton} onClick={onSave}>
        Download glTF
      </button>
      <div
        ref={viewerContainerRef}
        className={`${styles.viewerContainer} ${
          isDragging ? styles.dragging : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className={styles.dropOverlay}>
            <p>Drop 3D model here</p>
          </div>
        )}
        <model-viewer
          id="viewer"
          ref={modelViewerRef}
          className={styles.viewer}
          src={filePath}
          camera-controls
          autoplay
          animation-name={currentSelectAnimation}
          ar
          ar-modes="webxr scene-viewer"
          shadow-intensity="1"
        ></model-viewer>
      </div>
    </Fragment>
  );
};

export default memo(Viewer);
