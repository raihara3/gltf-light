// lib
import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';

// states
import {
  polygonCountState,
  copyrightState,
  copyrightLockedState,
} from "../../state/atoms/ModelInfo";
import { upload3DModelSelector } from "../../state/selectors/Upload3DModelSelector";

// components
import TwoColumn from "../../layouts/TwoColumn"
import PencilIcon from "../icons/PencilIcon";

// styles
import styles from "../../styles/components/statistics.module.scss";

const Statistics = () => {
  const upload3DModel = useRecoilValue(upload3DModelSelector);
  const polygonCount = useRecoilValue(polygonCountState);
  const [copyright, setCopyright] = useRecoilState(copyrightState);
  const copyrightLocked = useRecoilValue(copyrightLockedState);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const onChangeCopyright = useCallback((event) => {
    setCopyright(event.target.value);
  }, [setCopyright]);

  const onClickEdit = useCallback(() => {
    setIsEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const onBlurInput = useCallback(() => {
    setIsEditing(false);
  }, []);

  const renderCopyright = () => {
    if (copyrightLocked) {
      return <div className="text-overflow">{copyright}</div>;
    }
    return (
      <div className={styles.copyrightField}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.copyrightInput} ${isEditing ? styles.copyrightInputActive : ""}`}
          value={copyright}
          onChange={onChangeCopyright}
          onBlur={onBlurInput}
          placeholder="—"
          readOnly={!isEditing}
        />
        <button
          type="button"
          className={styles.copyrightEditButton}
          onClick={onClickEdit}
          aria-label="Edit copyright"
        >
          <PencilIcon />
        </button>
      </div>
    );
  };

  return (
    <Fragment>
      <h3 className="title">Statistics</h3>
      {upload3DModel.filePath && (
        <Fragment>
          <TwoColumn
            left="Name:"
            right={<div className="text-overflow">{upload3DModel.name}</div>}
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
          <TwoColumn
            left="Copyright:"
            right={renderCopyright()}
            className="note"
          />
        </Fragment>
      )}
    </Fragment>
  )
}

export default memo(Statistics);
