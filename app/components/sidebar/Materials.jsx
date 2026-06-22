// lib
import { memo, Fragment, useCallback, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

// states
import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState,
  texturesState,
  updateMaterialProperty
} from "../../state/atoms/ModelInfo";

// hooks
import { useSelectMaterialByName } from "../../hooks/useSelectMaterialByName";

// components
import MaterialIcon from "../icons/MaterialIcon";

// utils
import { MATERIAL_TEXTURE_SLOTS } from "../../utils/materialTextureSlots";

const Materials = () => {
  const [materials, setMaterials] = useRecoilState(materialsState);
  const textures = useRecoilValue(texturesState);
  const selectedMaterialName = useRecoilValue(selectedMaterialNameState);
  const [materialProperties, setMaterialProperties] = useRecoilState(materialPropertiesState);
  const selectMaterialByName = useSelectMaterialByName();
  const [expandOverrides, setExpandOverrides] = useState({});

  const texturesByUuid = useMemo(() => {
    const lookup = new Map();
    for (const texture of textures) {
      lookup.set(texture.uuid, texture);
    }
    return lookup;
  }, [textures]);

  const handleMaterialClick = useCallback((material) => {
    selectMaterialByName(material.name);
  }, [selectMaterialByName]);

  const handleToggleExpand = useCallback((event, materialName, currentlyExpanded) => {
    event.stopPropagation();
    setExpandOverrides((previous) => ({
      ...previous,
      [materialName]: !currentlyExpanded,
    }));
  }, []);

  const handleRoughnessChange = useCallback((event) => {
    const value = parseFloat(event.target.value);
    setMaterialProperties((prev) => ({
      ...prev,
      roughness: value,
    }));
    if (selectedMaterialName) {
      setMaterials((prev) => updateMaterialProperty(prev, selectedMaterialName, "roughness", value));
    }
  }, [setMaterialProperties, selectedMaterialName, setMaterials]);

  const handleMetalnessChange = useCallback((event) => {
    const value = parseFloat(event.target.value);
    setMaterialProperties((prev) => ({
      ...prev,
      metalness: value,
    }));
    if (selectedMaterialName) {
      setMaterials((prev) => updateMaterialProperty(prev, selectedMaterialName, "metalness", value));
    }
  }, [setMaterialProperties, selectedMaterialName, setMaterials]);

  return (
    <Fragment>
      <h3 className="title">Materials ({materials.length})</h3>
      {materials.map((material, index) => {
        const isSelected = selectedMaterialName === material.name;
        const override = expandOverrides[material.name];
        const isExpanded = override === undefined ? isSelected : override;
        const slotEntries = MATERIAL_TEXTURE_SLOTS
          .map((slot) => {
            const map = material[slot.key];
            if (!map || !map.uuid) return null;
            const texture = texturesByUuid.get(map.uuid);
            if (!texture) return null;
            return { ...slot, texture };
          })
          .filter(Boolean);
        const hasTextures = slotEntries.length > 0;

        return (
          <Fragment key={index}>
            <div
              className="note text-overflow"
              onClick={() => handleMaterialClick(material)}
              style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? 'rgba(144, 188, 208, 0.25)' : 'transparent',
                color: isSelected ? '#ffffff' : undefined,
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {hasTextures ? (
                <button
                  type="button"
                  onClick={(event) => handleToggleExpand(event, material.name, isExpanded)}
                  aria-label={isExpanded ? 'Collapse textures' : 'Expand textures'}
                  aria-expanded={isExpanded}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: '14px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    fontSize: '10px',
                    lineHeight: 1,
                    cursor: 'pointer',
                  }}
                >
                  {isExpanded ? '▾' : '▸'}
                </button>
              ) : (
                <span style={{ display: 'inline-block', flexShrink: 0, width: '14px' }} />
              )}
              <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                <MaterialIcon size={14} />
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{material.name}</span>
            </div>
            {hasTextures && isExpanded && (
              <ul
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  listStyle: 'none',
                  margin: '4px 0 8px 30px',
                  padding: 0,
                }}
              >
                {slotEntries.map((entry) => (
                  <li
                    key={entry.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      width: '56px',
                    }}
                  >
                    <img
                      src={entry.texture.src}
                      alt={`${entry.label}: ${entry.texture.name}`}
                      title={entry.texture.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: 'solid 1px rgba(144, 188, 208, 0.4)',
                        borderRadius: '2px',
                        objectFit: 'cover',
                      }}
                    />
                    <span
                      style={{
                        overflow: 'hidden',
                        width: '100%',
                        color: 'rgba(144, 188, 208, 0.8)',
                        fontSize: '9px',
                        textAlign: 'center',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Fragment>
        );
      })}

      {selectedMaterialName && (
        <div style={{ marginTop: '16px', padding: '8px' }}>
          <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>Material Properties</h4>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Roughness: {materialProperties.roughness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProperties.roughness}
              onChange={handleRoughnessChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Metalness: {materialProperties.metalness.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProperties.metalness}
              onChange={handleMetalnessChange}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default memo(Materials);
