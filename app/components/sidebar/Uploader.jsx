"use client";

// lib
import { memo, useRef, useCallback, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';

// stores
import { filePathState } from "../../state/atoms/Upload3DModelAtom";
import {
  animationsState,
  polygonCountState,
  materialsState,
  texturesState,
} from "../../state/atoms/ModelInfo";
import { upload3DModelSelector } from "../../state/selectors/Upload3DModelSelector";
import { currentSelectAnimationState } from "../../state/atoms/CurrentSelect";

// models
import Upload3DModel from "../../models/Upload3DModel";

// classes
import GLTFModel from "../../classes/GLTFModel";

// styles
import styles from "../../styles/components/uploader.module.scss";

const Uploader = () => {
  const upload3DModelRef = useRef(new Upload3DModel());
  const gltfModelRef = useRef(new GLTFModel());

  const filePath = useRecoilValue(filePathState);
  const setUpload3DModelSelector = useSetRecoilState(upload3DModelSelector);
  const setAnimations = useSetRecoilState(animationsState);
  const setPolygonCount = useSetRecoilState(polygonCountState);
  const setCurrentSelectAnimation = useSetRecoilState(currentSelectAnimationState);
  const setMaterials = useSetRecoilState(materialsState);
  const setTextures = useSetRecoilState(texturesState);

  const onChangeFile = useCallback((file) => {
    upload3DModelRef.current.setFile(file);
    setUpload3DModelSelector({
      name: upload3DModelRef.current.name,
      filePath: upload3DModelRef.current.filePath,
      fileSize: upload3DModelRef.current.fileSize,
    })
  }, [])

  useEffect(() => {
    if(!filePath) return;

    gltfModelRef.current.load(filePath).then(() => {
      const animations = gltfModelRef.current.getAnimations()
      setAnimations(animations);
      setCurrentSelectAnimation(animations[0]);
      setPolygonCount(gltfModelRef.current.getPolygonCount());
      setMaterials(gltfModelRef.current.getMaterials())
      setTextures(gltfModelRef.current.getTextures())
    })
  }, [filePath])

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
        Upload 3D model<br/>
        ( glb )
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