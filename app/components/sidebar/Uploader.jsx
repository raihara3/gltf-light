"use client";

// lib
import { memo, useRef, useCallback, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

// stores
import { filePathState } from "../../state/atoms/Upload3DModelAtom";
import {
  animationsState,
  polygonCountState,
  materialsState,
  texturesState,
} from "../../state/atoms/ModelInfo";
import { logsState } from "../../state/atoms/Logs";
import { upload3DModelSelector } from "../../state/selectors/Upload3DModelSelector";
import { currentSelectAnimationState } from "../../state/atoms/CurrentSelect";

// models
import Upload3DModel from "../../models/Upload3DModel";

// classes
import GLTFModel from "../../classes/GLTFModel";
import Logger, { LogType } from "../../classes/Logger";

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
  const [logs, setLogs] = useRecoilState(logsState);

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

      const materials = gltfModelRef.current.getMaterials()
      setMaterials(materials)

      setTextures(gltfModelRef.current.getTextures(materials))

      const getLog = async() => {
        const uploadLog = Logger.log({
          logType: LogType.INFO,
          message: `${upload3DModelRef.current.name} upload.`
        })
        const validateLogs = await gltfModelRef.current.validate()
        setLogs(logs.concat([uploadLog], validateLogs))
      }
      getLog();
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