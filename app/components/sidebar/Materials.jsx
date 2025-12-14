// lib
import { memo, Fragment, useCallback } from 'react';
import { useRecoilState } from 'recoil';

// states
import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState,
  updateMaterialProperty
} from "../../state/atoms/ModelInfo";

const Materials = () => {
  const [materials, setMaterials] = useRecoilState(materialsState);
  const [selectedMaterialName, setSelectedMaterialName] = useRecoilState(selectedMaterialNameState);
  const [materialProperties, setMaterialProperties] = useRecoilState(materialPropertiesState);

  const handleMaterialClick = useCallback((material) => {
    setSelectedMaterialName(material.name);

    // 選択したマテリアルの現在の値をセット
    setMaterialProperties({
      roughness: material.roughness !== undefined ? material.roughness : 0.5,
      metalness: material.metalness !== undefined ? material.metalness : 0.5,
    });
  }, [setSelectedMaterialName, setMaterialProperties]);

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
            backgroundColor: selectedMaterialName === material.name ? '#444' : 'transparent',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
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