import { useCallback, useState } from "react";
import { useModelStore } from "../store/modelStore";
import { useUiStore } from "../store/uiStore";

const GLB_EXTENSION = ".glb";

/**
 * Upload handling for the .glb dropzone. Reads the selected file into an
 * ArrayBuffer and stores it as the immutable `originalBytes` in modelStore.
 * Only `.glb` is accepted (client-side processing only).
 */
export function useModelUpload() {
  const loadModel = useModelStore((state) => state.loadModel);
  const setMode = useUiStore((state) => state.setMode);
  const [error, setError] = useState<string | null>(null);

  const acceptFiles = useCallback(
    async (files: FileList | File[] | null) => {
      const file = files && files[0];
      if (!file) {
        return;
      }
      if (!file.name.toLowerCase().endsWith(GLB_EXTENSION)) {
        setError(".glb ファイルのみ対応しています");
        return;
      }
      setError(null);
      const originalBytes = await file.arrayBuffer();
      loadModel(originalBytes, { name: file.name, size: file.size });
      // Always land a freshly uploaded model in preview, even if the persisted
      // mode was "optimize" from a previous session.
      setMode("preview");
    },
    [loadModel, setMode]
  );

  return { acceptFiles, error };
}
