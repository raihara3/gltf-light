import { useCallback, useState } from "react";
import { useModelStore } from "../store/modelStore";
import { useUiStore } from "../store/uiStore";
import { useTranslations } from "../i18n/useTranslations";
import { analytics } from "../lib/analytics";

const GLB_EXTENSION = ".glb";

/**
 * Upload handling for the .glb dropzone. Reads the selected file into an
 * ArrayBuffer and stores it as the immutable `originalBytes` in modelStore.
 * Only `.glb` is accepted (client-side processing only).
 */
export function useModelUpload() {
  const loadModel = useModelStore((state) => state.loadModel);
  const setMode = useUiStore((state) => state.setMode);
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);

  const acceptFiles = useCallback(
    async (files: FileList | File[] | null, source: "click" | "drop" = "click") => {
      const file = files && files[0];
      if (!file) {
        return;
      }
      if (!file.name.toLowerCase().endsWith(GLB_EXTENSION)) {
        setError(t("upload.error.glbOnly"));
        return;
      }
      setError(null);
      const originalBytes = await file.arrayBuffer();
      loadModel(originalBytes, { name: file.name, size: file.size });
      analytics.modelUpload(source, +(file.size / 1024 / 1024).toFixed(2));
      // Always land a freshly uploaded model in preview, even if the persisted
      // mode was "optimize" from a previous session.
      setMode("preview");
    },
    [loadModel, setMode, t]
  );

  return { acceptFiles, error };
}
