"use client";

import { useModelStore } from "./store/modelStore";
import { Header } from "./components/Header";
import { ServiceInfo } from "./components/ServiceInfo";
import { FileDropzone } from "./components/FileDropzone";
import { ModelSummaryCard } from "./components/ModelSummaryCard";
import { Copyright } from "./components/Copyright";
import styles from "./styles/page.module.scss";

/**
 * v2 landing (`/`). The shell (header, mode switch, theme) plus the model
 * upload flow. Uploading a `.glb` fills modelStore and switches the sidebar
 * to the model overview (Figma preview screen). The 3D viewer, context tabs
 * and optimization UI that consume that state arrive in later issues.
 */
export default function V2Page() {
  const hasModel = useModelStore((state) => state.originalBytes !== null);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          {hasModel ? (
            <>
              <FileDropzone />
              <ModelSummaryCard />
            </>
          ) : (
            <ServiceInfo />
          )}
        </aside>
        <section className={styles.viewer} aria-label="3Dビュー">
          <div className={styles.viewerBody}>
            {hasModel ? (
              <p className={styles.viewerNote}>3Dビューアは今後のステップで実装されます</p>
            ) : (
              <FileDropzone />
            )}
          </div>
          <Copyright />
        </section>
      </main>
    </>
  );
}
