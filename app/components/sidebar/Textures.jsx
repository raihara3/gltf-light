// lib
import { memo, Fragment } from 'react';
import { useRecoilValue } from 'recoil';

// states
import { texturesState } from "../../state/atoms/ModelInfo";

// components
import TwoColumn from "../../layouts/TwoColumn";

const Textures = () => {
  const textures = useRecoilValue(texturesState);

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
                {/* <button className="button button--normal">Resize</button> */}
              </div>
            </div>
          }
        />
      ))}
    </Fragment>
  )
}

export default memo(Textures);