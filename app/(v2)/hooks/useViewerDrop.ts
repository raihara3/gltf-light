"use client";

import { useCallback, useState } from "react";
import { useModelUpload } from "./useModelUpload";

/**
 * Drag & drop a `.glb` anywhere on the viewer area to load it (F: upload from
 * the 3D view). Returns the drag state (for a drop overlay) and the handlers to
 * spread onto the viewer container.
 */
export function useViewerDrop() {
  const { acceptFiles } = useModelUpload();
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Ignore leave events fired when moving between child elements.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      void acceptFiles(event.dataTransfer.files, "drop");
    },
    [acceptFiles]
  );

  return { isDragging, dropProps: { onDragOver, onDragLeave, onDrop } };
}
