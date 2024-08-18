// lib
import { memo, Fragment } from 'react';
import { useRecoilValue } from 'recoil';

// states
import { materialsState } from "../../state/atoms/ModelInfo";

const Materials = () => {
  const materials = useRecoilValue(materialsState);

  return (
    <Fragment>
      <h3 className="title">Materials ({materials.length})</h3>
      {materials.map((material, index) => (
        <div key={index} className="note text-overflow">
          {material.name}
        </div>
      ))}
    </Fragment>
  )
}

export default memo(Materials);