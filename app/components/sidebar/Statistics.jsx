// lib
import { Fragment, memo } from 'react';
import { useRecoilValue } from 'recoil';

// states
import { polygonCountState } from "../../state/atoms/ModelInfo";
import { upload3DModelSelector } from "../../state/selectors/Upload3DModelSelector";

// components
import TwoColumn from "../../layouts/TwoColumn"

const Statistics = () => {
  const upload3DModel = useRecoilValue(upload3DModelSelector);
  const polygonCount = useRecoilValue(polygonCountState);

  return (
    <Fragment>
      <h3 className="title">Statistics</h3>
      {upload3DModel.filePath && (
        <Fragment>
          <TwoColumn
            left="Name:"
            right={upload3DModel.name}
            className="note"
          />
          <TwoColumn
            left="Size:"
            right={upload3DModel.fileSize}
            className="note"
          />
          <TwoColumn
            left="Polygon:"
            right={polygonCount.toLocaleString()}
            className="note"
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default memo(Statistics);