"use client";

// lib
import { memo, useRef, useCallback } from 'react';
import { useRecoilState } from 'recoil';

// styles
import styles from "../styles/components/uploader.module.scss";

// models
import Upload3DModel from "../models/Upload3DModel";

const Uploader = () => {

  const upload3DModelRef = useRef(new Upload3DModel());

  const onChangeFile = useCallback((file) => {
    upload3DModelRef.current.setFile(file);
    console.log(upload3DModelRef.current.fileSize)
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