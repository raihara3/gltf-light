"use client";

import { useModelStore } from "./store/modelStore";
import { Header } from "./components/Header";
import { ServiceInfo } from "./components/ServiceInfo";
import { FileDropzone } from "./components/FileDropzone";
import { Copyright } from "./components/Copyright";
import { ModelWorkspace } from "./features/preview/ModelWorkspace";
import styles from "./styles/page.module.scss";

/**
 * v2 landing (`/`). Empty state = service info + hero uploader; once a `.glb`
 * is loaded, the ModelWorkspace takes over (preview sidebar + 3D viewer).
 */
export default function V2Page() {
  const hasModel = useModelStore((state) => state.originalBytes !== null);

  return (
    <>
      <Header />
      <main className={styles.main}>
        {hasModel ? (
          <ModelWorkspace />
        ) : (
          <>
            <aside className={styles.sidebar}>
              <ServiceInfo />
            </aside>
            <section className={styles.viewer} aria-label="3Dビュー">
              <div className={styles.viewerBody}>
                <FileDropzone variant="hero" />
              </div>
              <Copyright />
            </section>
          </>
        )}
      </main>
    </>
  );
}
