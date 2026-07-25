import type { PipelineRequest, PipelineResponse, PipelineSettings, PipelineStats } from "./types";

export interface PipelineResult {
  outBytes: ArrayBuffer;
  stats: PipelineStats;
}

/** Thrown when a newer request supersedes this one (generation token). */
export class SupersededError extends Error {
  constructor() {
    super("superseded");
    this.name = "SupersededError";
  }
}

let worker: Worker | null = null;
let latestId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./optimize.worker.ts", import.meta.url));
  }
  return worker;
}

/**
 * Run the optimize pipeline in the shared Worker. A generation token ensures
 * only the most recent request resolves — older in-flight results are rejected
 * with SupersededError so callers can ignore them. The original bytes are never
 * transferred; a `slice(0)` copy is sent so `originalBytes` stays intact (§5.3).
 */
export function runPipeline(bytes: ArrayBuffer, settings: PipelineSettings): Promise<PipelineResult> {
  const id = ++latestId;
  const activeWorker = getWorker();
  const copy = bytes.slice(0);

  return new Promise<PipelineResult>((resolve, reject) => {
    const onMessage = (event: MessageEvent<PipelineResponse>) => {
      const data = event.data;
      if (data.id !== id) {
        return;
      }
      activeWorker.removeEventListener("message", onMessage);
      if (id !== latestId) {
        reject(new SupersededError());
        return;
      }
      if (data.type === "result") {
        resolve({ outBytes: data.outBytes, stats: data.stats });
      } else {
        reject(new Error(data.message));
      }
    };
    activeWorker.addEventListener("message", onMessage);
    const request: PipelineRequest = { id, bytes: copy, settings };
    activeWorker.postMessage(request, [copy]);
  });
}
