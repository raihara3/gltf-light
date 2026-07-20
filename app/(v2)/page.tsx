"use client";

import { useUiStore } from "./store/uiStore";
import { Header } from "./components/Header";
import { UploadIcon } from "./icons";
import styles from "./styles/page.module.scss";

/**
 * v2 landing (`/`). This issue (#28) delivers the shell only: header with the
 * preview/optimize mode switch and theme toggle, plus a two-column skeleton.
 * The 3D viewer and optimization pipeline arrive in later issues.
 */
export default function V2Page() {
  const mode = useUiStore((state) => state.mode);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <aside className={styles.sidebar}>
          {mode === "preview" ? <PreviewPanel /> : <OptimizePanel />}
        </aside>
        <section className={styles.viewer} aria-label="3Dビュー">
          <div className={styles.dropzone}>
            <UploadIcon size={28} />
            <p className={styles.dropzoneTitle}>3Dモデルをアップロード</p>
            <p className={styles.dropzoneHint}>ドラッグ&amp;ドロップ、またはクリック（.glb）</p>
            <p className={styles.dropzoneNote}>※サーバーにアップロードすることはありません</p>
          </div>
          <p className={styles.viewerNote}>3Dビューアは今後のステップで実装されます</p>
        </section>
      </main>
    </>
  );
}

function PreviewPanel() {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>プレビュー</h2>
      <p className={styles.cardHint}>
        モデル概要・アニメーション・マテリアル・メッシュ構造をここに表示します。
      </p>
    </div>
  );
}

function OptimizePanel() {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>軽量化の設定</h2>
      <p className={styles.cardHint}>
        不要データの削除・テクスチャ最適化・ポリゴン削減の設定をここに表示します。
      </p>
    </div>
  );
}
