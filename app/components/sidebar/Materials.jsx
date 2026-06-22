// lib
import { memo, Fragment, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

// states
import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState,
  updateMaterialProperty
} from "../../state/atoms/ModelInfo";

// hooks
import { useSelectMaterialByName } from "../../hooks/useSelectMaterialByName";

// components
import MaterialIcon from "../icons/MaterialIcon";

const Materials = () => {
  const [materials, setMaterials] = useRecoilState(materialsState);
  const selectedMaterialName = useRecoilValue(selectedMaterialNameState);
  const [materialProperties, setMaterialProperties] = useRecoilState(materialPropertiesState);
  const selectMaterialByName = useSelectMaterialByName();

  const handleMaterialClick = useCallback((material) => {
    selectMaterialByName(material.name);
  }, [selectMaterialByName]);

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
      {materials.map((material, index) => (
        <div
          key={index}
          className="note text-overflow"
          onClick={() => handleMaterialClick(material)}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedMaterialName === material.name ? 'rgba(144, 188, 208, 0.25)' : 'transparent',
            color: selectedMaterialName === material.name ? '#ffffff' : undefined,
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>
            <MaterialIcon size={14} />
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{material.name}</span>
        </div>
      ))}

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