// lib
import { memo, Fragment, useState } from "react";
import { useRecoilValue } from "recoil";

// states
import { filePathState } from "../state/atoms/Upload3DModelAtom";

// component
import Viewer from "../components/Viewer";
import Logbox from "../components/Logbox";
import TextureResizeModal from "../components/TextureResizeModal";

// styles
import styles from "../styles/layouts/mainContent.module.scss";

const MainContent = () => {
  const filePath = useRecoilValue(filePathState);
  const [currentResizeTexture, setCurrentResizeTexture] = useState(null);

  return (
    <div className={styles.wrap}>
      {filePath ? (
        <Fragment>
          <Viewer currentResizeTexture={currentResizeTexture} />
          <Logbox />
          <TextureResizeModal
            setCurrentResizeTexture={setCurrentResizeTexture}
          />
        </Fragment>
      ) : (
        <div className={styles.innerBox}>
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
      )}
    </div>
  );
};

export default memo(MainContent);
