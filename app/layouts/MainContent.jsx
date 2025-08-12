// lib
import { memo, Fragment, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";

// component
import Viewer from "../components/Viewer";
import ThreeViewer from "../components/ThreeViewer";
import Logbox from "../components/Logbox";
import TextureResizeModal from "../components/TextureResizeModal";

// hooks
import { useModelUpload } from "../hooks/useModelUpload";

// styles
import styles from "../styles/layouts/mainContent.module.scss";

const MainContent = () => {
  const filePath = useRecoilValue(filePathState);
  const { onChangeFile } = useModelUpload();
  const [currentResizeTexture, setCurrentResizeTexture] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 環境変数でビューワーを切り替え
  const useThreeViewer = process.env.NEXT_PUBLIC_USE_THREE_VIEWER === 'true';
  const ViewerComponent = useThreeViewer ? ThreeViewer : Viewer;

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

  // ドラッグアンドドロップ機能を追加
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        onChangeFile(file);
      }
    },
    [onChangeFile]
  );

  return (
    <div className={styles.wrap}>
      {filePath ? (
        <Fragment>
          <ViewerComponent currentResizeTexture={currentResizeTexture} />
          <Logbox />
          <TextureResizeModal
            setCurrentResizeTexture={setCurrentResizeTexture}
          />
        </Fragment>
      ) : (
        <div
          style={{ height: "100%" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className={styles.dropOverlay}>
              <p>Drop 3D model here</p>
            </div>
          )}
          <div className={styles.innerBox}>
            <h2>Drop 3D model here</h2>
            This is lightweight service specialized in GLTF.
            <br />
            Displays warning on using glb in WebAR.
            <br />
            No data is uploaded to an external server.
            <br />
            <img
              className={styles.symbolMark}
              src="/images/rocket.png"
              alt="rocket"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MainContent);
