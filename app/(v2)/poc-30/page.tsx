"use client";

// PoC (issue #30) — throwaway harness. Run at /poc-30, read logs, then discard.
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function Poc30Page() {
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [gltfLoad, setGltfLoad] = useState<string>("pending");

  useEffect(() => {
    const add = (line: string) => setLogs((prev) => [...prev, line]);

    const worker = new Worker(new URL("./poc.worker.ts", import.meta.url));
    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === "log") {
        add(`worker: ${msg.message}`);
      } else if (msg.type === "error") {
        add(`ERROR: ${msg.message}`);
      } else if (msg.type === "done") {
        setSummary(msg.summary);
        add("worker: done");
        // 3) verify output glb is readable by three.js GLTFLoader
        new GLTFLoader().parse(
          msg.outBytes,
          "",
          (gltf) => {
            let triangles = 0;
            gltf.scene.traverse((object) => {
              const mesh = object as { geometry?: { index?: { count: number }; attributes?: { position?: { count: number } } } };
              const geometry = mesh.geometry;
              if (geometry) {
                triangles += (geometry.index?.count ?? geometry.attributes?.position?.count ?? 0) / 3;
              }
            });
            setGltfLoad(`OK — scene parsed, ~${Math.round(triangles)} triangles`);
            add(`main: GLTFLoader.parse(outBytes) OK (~${Math.round(triangles)} triangles)`);
          },
          (error) => {
            setGltfLoad(`FAILED: ${String(error)}`);
            add(`main: GLTFLoader.parse FAILED: ${String(error)}`);
          }
        );
      }
    };

    (async () => {
      add("main: fetching /test.glb");
      const response = await fetch("/test.glb");
      const bytes = await response.arrayBuffer();
      add(`main: got ${bytes.byteLength} bytes; posting to worker`);
      worker.postMessage({ bytes }, [bytes.slice(0)]);
    })();

    return () => worker.terminate();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}>
      <h1>PoC #30 — gltf-transform in Worker</h1>
      <p data-testid="gltf-load">GLTFLoader(outBytes): {gltfLoad}</p>
      <pre data-testid="summary" style={{ background: "#f2efe9", padding: 12, borderRadius: 8 }}>
        {summary ? JSON.stringify(summary, null, 2) : "(running…)"}
      </pre>
      <h2>Log</h2>
      <pre data-testid="log" style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 8 }}>
        {logs.join("\n")}
      </pre>
    </div>
  );
}
