import { UploadIcon } from "../icons";
import styles from "./FileDropzone.module.scss";

/**
 * Upload dropzone (visual only for now). File handling and 3D parsing are added
 * in a later issue; this renders the approved empty-state prompt.
 */
export function FileDropzone() {
  return (
    <div className={styles.dropzone}>
      <span className={styles.icon}>
        <UploadIcon size={24} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>3Dモデルをアップロード</p>
        <p className={styles.hint}>ドラッグ&amp;ドロップ、またはクリック（.glb）</p>
        <p className={styles.note}>※サーバーにアップロードすることはありません</p>
      </div>
    </div>
  );
}
