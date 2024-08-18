"use client";

// lib
import { memo, useRef, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

// stores
import { upload3DModelSelector } from "../state/selectors/Upload3DModelSelector";

// models
import Upload3DModel from "../models/Upload3DModel";

// styles
import styles from "../styles/components/uploader.module.scss";

const Uploader = () => {
  const upload3DModelRef = useRef(new Upload3DModel());

  const setUpload3DModelSelector = useSetRecoilState(upload3DModelSelector);

  const onChangeFile = useCallback((file) => {
    upload3DModelRef.current.setFile(file);
    setUpload3DModelSelector({
      name: upload3DModelRef.current.name,
      filePath: upload3DModelRef.current.filePath,
      fileSize: upload3DModelRef.current.fileSize,
    })
  }, [])

  return (
    <div>
      <label
        className={styles.uploader}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          onChangeFile(file);
        }}
      >
        Upload glb
        <input
          type="file"
          accept=".glb"
          hidden
          onChange={(event) => {
            event.preventDefault();
            const file = event.target.files[0];
            onChangeFile(file);
          }}
        />
      </label>
    </div>
  );
}

export default memo(Uploader);