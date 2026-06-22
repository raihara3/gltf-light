// lib
import { memo, Fragment, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// states
import {
  texturesState,
  materialsState,
  selectedMaterialNameState,
} from "../../state/atoms/ModelInfo";
import { currentSelectTextureState } from "../../state/atoms/CurrentSelect";

// components
import TwoColumn from "../../layouts/TwoColumn";

// utils
import { getMaterialTextureUuids } from "../../utils/materialTextureSlots";

const Textures = () => {
  const textures = useRecoilValue(texturesState);
  const materials = useRecoilValue(materialsState);
  const selectedMaterialName = useRecoilValue(selectedMaterialNameState);
  const currentSelectTexture = useSetRecoilState(currentSelectTextureState);

  const highlightedTextureUuids = useMemo(() => {
    if (!selectedMaterialName) return new Set();
    const material = materials.find((entry) => entry.name === selectedMaterialName);
    return getMaterialTextureUuids(material);
  }, [materials, selectedMaterialName]);

  return (
    <Fragment>
      <h3 className="title">Textures ({textures.length})</h3>
      {textures.map((texture, index) => {
        const isHighlighted = highlightedTextureUuids.has(texture.uuid);
        return (
          <TwoColumn
            style={{
              minHeight: "70px",
              padding: "4px",
              border: "solid 2px transparent",
              borderColor: isHighlighted ? "rgba(144, 188, 208, 0.6)" : "transparent",
              borderRadius: "4px",
              backgroundColor: isHighlighted ? "rgba(144, 188, 208, 0.1)" : "transparent",
            }}
            key={index}
            left={<img src={texture.src} style={{width: "100%"}} />}
            right={
              <div className="note text-overflow">
                {texture.name}<br />
                w{texture.width}px / h{texture.height}px<br />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>{texture.fileSize}</div>
                  <button
                    className="button button--normal"
                    onClick={() => {
                      currentSelectTexture(texture)
                    }}
                  >
                    Resize
                  </button>
                </div>
              </div>
            }
          />
        );
      })}
    </Fragment>
  )
}

export default memo(Textures);