// lib
import { memo, Fragment, useCallback } from 'react';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';

// hooks
import { useTestMode } from "../../hooks/useQueryParams";

// states
import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState
} from "../../state/atoms/ModelInfo";

const Materials = () => {
  const isTestMode = useTestMode();
  const materials = useRecoilValue(materialsState);
  const [selectedMaterialName, setSelectedMaterialName] = useRecoilState(selectedMaterialNameState);
  const [materialProperties, setMaterialProperties] = useRecoilState(materialPropertiesState);

  const handleMaterialClick = useCallback((material) => {
    if (!isTestMode) return;

    setSelectedMaterialName(material.name);

    // 選択したマテリアルの現在の値をセット
    setMaterialProperties({
      roughness: material.roughness !== undefined ? material.roughness : 0.5,
      metalness: material.metalness !== undefined ? material.metalness : 0.5,
    });
  }, [isTestMode, setSelectedMaterialName, setMaterialProperties]);

  const handleRoughnessChange = useCallback((event) => {
    const value = parseFloat(event.target.value);
    setMaterialProperties((prev) => ({
      ...prev,
      roughness: value,
    }));
  }, [setMaterialProperties]);

  const handleMetalnessChange = useCallback((event) => {
    const value = parseFloat(event.target.value);
    setMaterialProperties((prev) => ({
      ...prev,
      metalness: value,
    }));
  }, [setMaterialProperties]);

  return (
    <Fragment>
      <h3 className="title">Materials ({materials.length})</h3>
      {materials.map((material, index) => (
        <div
          key={index}
          className="note text-overflow"
          onClick={() => handleMaterialClick(material)}
          style={{
            cursor: isTestMode ? 'pointer' : 'default',
            backgroundColor: isTestMode && selectedMaterialName === material.name ? '#444' : 'transparent',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {material.name}
        </div>
      ))}

      {isTestMode && selectedMaterialName && (
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