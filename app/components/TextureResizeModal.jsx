// lib
import { memo, useEffect, useState, useCallback, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";

// states
import { texturesState } from "../state/atoms/ModelInfo";
import { currentSelectTextureState } from "../state/atoms/CurrentSelect";

// classes
import ResizeTexture from "../classes/ResizeTexture";

// components
import TwoColumn from "../layouts/TwoColumn";

// styles
import styles from "../styles/components/textureResize.module.scss";

const TextureResizeModal = ({ setCurrentResizeTexture }) => {
  const [currentTexture, setCurrentTexture] = useRecoilState(
    currentSelectTextureState
  );
  const [textures, setTextures] = useRecoilState(texturesState);
  const [resizeTexture, setResizeTexture] = useState(null);
  const [isShow, setIsShow] = useState(false);

  const resizeTextureRef = useRef(new ResizeTexture());

  const onClose = useCallback(() => {
    setIsShow(false);
    setResizeTexture(null);
    setCurrentTexture({});
  }, []);

  const onResize = useCallback(
    async (size) => {
      const texture = await resizeTextureRef.current.resize({
        texture: currentTexture,
        width: size,
      });
      setResizeTexture(texture);
      setCurrentResizeTexture(texture);
    },
    [currentTexture]
  );

  const onConfirm = useCallback(() => {
    setTextures(
      textures.map((texture) => {
        if (texture.uuid === resizeTexture.uuid) {
          return resizeTexture;
        }
        return texture;
      })
    );
    onClose();
  }, [textures, resizeTexture]);

  useEffect(() => {
    if (!currentTexture.src) return;
    setIsShow(true);
  }, [currentTexture]);

  if (!isShow) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContainerHeader}>
        <h3 className={`sub-title`}>Texture resize(beta)</h3>
        <button
          className={`button`}
          onClick={() => {
            onClose();
          }}
        >
          close
        </button>
      </div>
      <TwoColumn
        left={
          <div>
            <img
              src={(resizeTexture && resizeTexture.src) || currentTexture.src}
              style={{ width: "100%" }}
            />
          </div>
        }
        right={
          <div className={`note`}>
            <div className={styles.warning}>
              Currently only textures used for base color are supported
            </div>
            <div style={{ marginBottom: "15px" }}>
              <h4 className={`sub-title`}>Current info</h4>
              <div>Name: {currentTexture.name}</div>
              <div>
                Size: w{currentTexture.width}px / h{currentTexture.height}px
              </div>
              <div>File size: {currentTexture.fileSize}</div>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <h4 className={`sub-title`}>Select size</h4>
              <div className={styles.buttonsBox}>
                <label>
                  <input
                    type="radio"
                    name="textureSize"
                    value="256"
                    onChange={() => onResize(256)}
                  />
                  256
                </label>
                <label>
                  <input
                    type="radio"
                    name="textureSize"
                    value="512"
                    onChange={() => onResize(512)}
                  />
                  512
                </label>
                <label>
                  <input
                    type="radio"
                    name="textureSize"
                    value="1024"
                    onChange={() => onResize(1024)}
                  />
                  1024
                </label>
                <label>
                  <input
                    type="radio"
                    name="textureSize"
                    value="2048"
                    onChange={() => onResize(2048)}
                  />
                  2048
                </label>
                <label>
                  <input
                    type="radio"
                    name="textureSize"
                    value="4096"
                    onChange={() => onResize(4096)}
                  />
                  4096
                </label>
              </div>
            </div>
            {resizeTexture && (
              <div>
                <h4 className={`sub-title`}>Resized info</h4>
                <div>
                  Size: w{resizeTexture.width}px / h{resizeTexture.height}px
                </div>
                <div>File size: {resizeTexture.fileSize}</div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    className={`button button--light ${styles.confirmButton}`}
                    onClick={() => {
                      onConfirm();
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default memo(TextureResizeModal);
