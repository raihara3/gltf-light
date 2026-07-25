"use client";

import { useEffect } from "react";
import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { runPipeline, SupersededError } from "../../pipeline/pipelineClient";
import { computeEstimate } from "../../pipeline/estimate";

/** Defer work to browser idle time so the 3D render/interaction stays first. */
function whenIdle(callback: () => void): () => void {
  if (typeof requestIdleCallback === "function") {
    const handle = requestIdleCallback(callback, { timeout: 500 });
    return () => cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, 200);
  return () => window.clearTimeout(handle);
}

/**
 * Auto-estimates the optimize result whenever the optimize sidebar is mounted
 * (and when a setting changes). The Worker keeps the main thread responsive and
 * the run is deferred to idle time so the 3D view renders/interacts first (F-17
 * / §5.2). Stale runs are ignored via the generation token.
 */
export function useOptimizePipeline() {
  const bytes = useModelStore((state) => state.originalBytes);
  const originalSize = useModelStore((state) => state.meta?.size ?? 0);
  const pruneDedup = useOptimizeStore((state) => state.settings.pruneDedup);
  const textureMaxSize = useOptimizeStore((state) => state.settings.textureMaxSize);
  const reduceEnabled = useOptimizeStore((state) => state.settings.reduce.enabled);
  const reduceRatio = useOptimizeStore((state) => state.settings.reduce.ratio);
  const deletedMaterials = useOptimizeStore((state) => state.settings.deletedMaterials);
  const deletedTextureSlots = useOptimizeStore((state) => state.settings.deletedTextureSlots);
  const setStatus = useOptimizeStore((state) => state.setStatus);
  const setResult = useOptimizeStore((state) => state.setResult);
  const setEstimate = useOptimizeStore((state) => state.setEstimate);

  useEffect(() => {
    if (!bytes) {
      return;
    }
    let cancelled = false;
    setStatus("estimating");
    setEstimate(null);

    const cancelIdle = whenIdle(() => {
      runPipeline(bytes, {
        pruneDedup,
        textureMaxSize,
        reduce: { enabled: reduceEnabled, ratio: reduceRatio },
        deletedMaterials,
        deletedTextureSlots,
      })
        .then((result) => {
          if (cancelled) {
            return;
          }
          setResult({
            bytes: result.outBytes,
            stats: {
              afterBytes: result.stats.size,
              polygons: result.stats.polygons,
              textures: result.stats.textures,
              unusedRemoved: result.stats.unusedRemoved,
            },
          });
          setEstimate(computeEstimate(originalSize, result.stats.size));
          setStatus("ready");
        })
        .catch((error) => {
          if (cancelled || error instanceof SupersededError) {
            return;
          }
          setStatus("error");
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [
    bytes,
    originalSize,
    pruneDedup,
    textureMaxSize,
    reduceEnabled,
    reduceRatio,
    deletedMaterials,
    deletedTextureSlots,
    setStatus,
    setResult,
    setEstimate,
  ]);
}
