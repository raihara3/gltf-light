// lib
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';

// states
import { texturesState } from "../state/atoms/ModelInfo";
import { currentSelectTextureState } from "../state/atoms/CurrentSelect";

// classes
import ResizeTexture from '../classes/ResizeTexture';

// components
import TwoColumn from "../layouts/TwoColumn";

// styles
import styles from "../styles/components/textureResize.module.scss"

const TextureResizeModal = () => {
  const currentSelectTexture = useRecoilValue(currentSelectTextureState);
  const [textures, setTextures] = useRecoilState(texturesState);
  const [isShow, setIsShow] = useState(false);

  const resizeTextureRef = useRef(new ResizeTexture());

  const onResize = useCallback(async(size) => {
    const resizedTexture = await resizeTextureRef.current.resize({ texture: currentSelectTexture, width: size });
    console.log(resizedTexture)
    // setTextures(textures.map(texture => {
    //   if(texture.uuid === currentSelectTexture.uuid) {
    //     return resizedTexture;
    //   }
    //   return texture;
    // }))
    // TODO: 差し替え確認
    setIsShow(false);
  }, [currentSelectTexture])

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
                <button className="button button--normal" onClick={() => onResize(256)}>256</button>
                <button className="button button--normal" onClick={() => onResize(512)}>512</button>
                <button className="button button--normal" onClick={() => onResize(1024)}>1024</button>
                <button className="button button--normal" onClick={() => onResize(2048)}>2048</button>
                <button className="button button--normal" onClick={() => onResize(4096)}>4096</button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default memo(TextureResizeModal);