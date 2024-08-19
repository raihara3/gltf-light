// lib
import { memo, Fragment } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// states
import { texturesState } from "../../state/atoms/ModelInfo";
import { currentSelectTextureState } from "../../state/atoms/CurrentSelect";

// components
import TwoColumn from "../../layouts/TwoColumn";

const Textures = () => {
  const textures = useRecoilValue(texturesState);
  const currentSelectTexture = useSetRecoilState(currentSelectTextureState);

  return (
    <Fragment>
      <h3 className="title">Textures ({textures.length})</h3>
      {textures.map((texture, index) => (
        <TwoColumn
          style={{ minHeight: "70px" }}
          key={index}
          left={<img src={texture.src} style={{width: "100%"}} />}
          right={
            <div className="note text-overflow">
              {texture.name}<br />
              w{texture.width}px / h{texture.height}px<br />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{texture.fileSize}</div>
                {/* <button
                  className="button button--normal"
                  onClick={() => {
                    currentSelectTexture(texture)
                  }}
                >
                  Resize
                </button> */}
              </div>
            </div>
          }
        />
      ))}
    </Fragment>
  )
}

export default memo(Textures);