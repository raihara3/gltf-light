// lib
import { memo, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

// states
import { currentSelectTextureState } from "../state/atoms/CurrentSelect";

// components
import TwoColumn from "../layouts/TwoColumn";

// styles
import styles from "../styles/components/textureResize.module.scss"

const TextureResizeModal = () => {
  const currentSelectTexture = useRecoilValue(currentSelectTextureState);
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    if(!currentSelectTexture.src) return
    setIsShow(true);
  }, [currentSelectTexture])

  if(!isShow) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContainerHeader}>
        <h3 className={`sub-title`}>Texture resize</h3>
        <button
          className={`button`}
          onClick={() => {
            setIsShow(false);
          }}
        >
          close
        </button>
      </div>
      <TwoColumn
        left={
          <div>
            <img src={currentSelectTexture.src} style={{ width: "100%" }} />
          </div>
        }
        right={
          <div className={`note`}>
            <div style={{ marginBottom: "15px" }}>
              <h4 className={`sub-title`}>Current info</h4>
              <div>Name: {currentSelectTexture.name}</div>
              <div>Size: w{currentSelectTexture.width}px / h{currentSelectTexture.height}px</div>
              <div>File size: {currentSelectTexture.fileSize}</div>
            </div>
            <div>
              <h4 className={`sub-title`}>Select size</h4>
              <div className={styles.buttonsBox}>
                <button className="button button--normal">256</button>
                <button className="button button--normal">512</button>
                <button className="button button--normal">1024</button>
                <button className="button button--normal">2048</button>
                <button className="button button--normal">4096</button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default memo(TextureResizeModal);