import { useCallback } from "react";
import { useSetRecoilState, useRecoilState } from "recoil";

// stores
import { filePathState } from "../state/atoms/Upload3DModelAtom";
import {
  animationsState,
  polygonCountState,
  materialsState,
  texturesState,
} from "../state/atoms/ModelInfo";
import { logsState } from "../state/atoms/Logs";
import { upload3DModelSelector } from "../state/selectors/Upload3DModelSelector";
import { currentSelectAnimationState } from "../state/atoms/CurrentSelect";

// models
import Upload3DModel from "../models/Upload3DModel";

// classes
import GLTFModel from "../classes/GLTFModel";
import Logger, { LogType } from "../classes/Logger";

export function useModelUpload() {
  const setUpload3DModelSelector = useSetRecoilState(upload3DModelSelector);
  const setAnimations = useSetRecoilState(animationsState);
  const setPolygonCount = useSetRecoilState(polygonCountState);
  const setCurrentSelectAnimation = useSetRecoilState(
    currentSelectAnimationState
  );
  const setMaterials = useSetRecoilState(materialsState);
  const setTextures = useSetRecoilState(texturesState);
  const [logs, setLogs] = useRecoilState(logsState);

  const upload3DModel = new Upload3DModel();
  const gltfModel = new GLTFModel();

  const onChangeFile = useCallback(
    (file) => {
      upload3DModel.setFile(file);
      setUpload3DModelSelector({
        name: upload3DModel.name,
        filePath: upload3DModel.filePath,
        fileSize: upload3DModel.fileSize,
      });

      // ファイルパスが設定されたら、モデルをロードして情報を設定
      if (upload3DModel.filePath) {
        gltfModel.load(upload3DModel.filePath).then(() => {
          const animations = gltfModel.getAnimations();
          setAnimations(animations);
          setCurrentSelectAnimation(animations[0]);
          setPolygonCount(gltfModel.getPolygonCount());

          const materials = gltfModel.getMaterials();
          setMaterials(materials);

          setTextures(gltfModel.getTextures(materials));

          const getLog = async () => {
            const uploadLog = Logger.log({
              logType: LogType.INFO,
              message: `${upload3DModel.name} upload.`,
            });
            const validateLogs = await gltfModel.validate();
            setLogs(logs.concat([uploadLog], validateLogs));
          };
          getLog();
        });
      }
    },
    [
      logs,
      setAnimations,
      setCurrentSelectAnimation,
      setLogs,
      setMaterials,
      setPolygonCount,
      setTextures,
      setUpload3DModelSelector,
    ]
  );

  return { onChangeFile };
}
