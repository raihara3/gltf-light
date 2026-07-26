"use client";

// lib
import { memo, Fragment } from "react";

// hooks
import { useModelUpload } from "../../hooks/useModelUpload";

// styles
import styles from "../../styles/components/uploader.module.scss";

const Uploader = ({ children }) => {
  const { onChangeFile } = useModelUpload();

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
        {children ? (
          children
        ) : (
          <Fragment>
            Upload 3D model
            <br />( glb )
          </Fragment>
        )}
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
};

export default memo(Uploader);
