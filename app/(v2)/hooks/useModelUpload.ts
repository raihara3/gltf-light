import { useCallback, useState } from "react";
import { useModelStore } from "../store/modelStore";

const GLB_EXTENSION = ".glb";

/**
 * Upload handling for the .glb dropzone. Reads the selected file into an
 * ArrayBuffer and stores it as the immutable `originalBytes` in modelStore.
 * Only `.glb` is accepted (client-side processing only).
 */
export function useModelUpload() {
  const loadModel = useModelStore((state) => state.loadModel);
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
    },
    [loadModel]
  );

  return { acceptFiles, error };
}
