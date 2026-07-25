"use client";

import { useEffect } from "react";
import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { runPipeline, SupersededError } from "../../pipeline/pipelineClient";

/**
 * Runs the prune/dedup pipeline in the Worker whenever the optimize sidebar is
 * mounted (and when the setting changes), storing the resulting bytes + stats.
 * The Worker keeps the main thread responsive; stale runs are ignored via the
 * generation token. (Estimate timing is refined in #34.)
 */
export function useOptimizePipeline() {
  const bytes = useModelStore((state) => state.originalBytes);
  const pruneDedup = useOptimizeStore((state) => state.settings.pruneDedup);
  const setStatus = useOptimizeStore((state) => state.setStatus);
  const setResult = useOptimizeStore((state) => state.setResult);

  useEffect(() => {
    if (!bytes) {
      return;
    }
    let cancelled = false;
    setStatus("estimating");
    runPipeline(bytes, { pruneDedup })
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
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled || error instanceof SupersededError) {
          return;
        }
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [bytes, pruneDedup, setStatus, setResult]);
}
