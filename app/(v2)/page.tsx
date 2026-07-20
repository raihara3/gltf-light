"use client";

import { Header } from "./components/Header";
import { ServiceInfo } from "./components/ServiceInfo";
import { FileDropzone } from "./components/FileDropzone";
import { Copyright } from "./components/Copyright";
import styles from "./styles/page.module.scss";

/**
 * v2 landing (`/`). This issue (#28) delivers the shell only: header with the
 * preview/optimize mode switch and theme toggle, plus the empty (no model)
 * state — sidebar service info and the upload dropzone. The 3D viewer and
 * optimization pipeline arrive in later issues, so the mode content is shared.
 */
export default function V2Page() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <ServiceInfo />
        </aside>
        <section className={styles.viewer} aria-label="3Dビュー">
          <div className={styles.viewerBody}>
            <FileDropzone />
          </div>
          <Copyright />
        </section>
      </main>
    </>
  );
}
