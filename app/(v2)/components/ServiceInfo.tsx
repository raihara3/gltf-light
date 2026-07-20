import { EyeIcon, FileIcon, ZapIcon, type IconProps } from "../icons";
import styles from "./ServiceInfo.module.scss";

type InfoCard = {
  Icon: (props: IconProps) => React.ReactElement;
  title: string;
  body: string;
  note?: string;
};

const CARDS: InfoCard[] = [
  {
    Icon: EyeIcon,
    title: "3Dモデルのプレビュー",
    body: "専用アプリがなくても3Dモデルをアップロードするだけで表示確認ができます。",
    note: "※サーバーにアップロードすることはありません",
  },
  {
    Icon: FileIcon,
    title: "アニメーションや詳細情報の確認",
    body: "3Dモデルに含まれるアニメーションの再生や、マテリアルや使用テクスチャ、メッシュ構造の確認も可能です。",
  },
  {
    Icon: ZapIcon,
    title: "最適化の提案とワンクリックでの反映",
    body: "3Dモデルをウェブで扱う上での最適化をご提案、ワンクリックで反映いただけます。ご自身での調整も可能です。",
  },
];

/** Sidebar content for the empty (no model loaded) state. */
export function ServiceInfo() {
  return (
    <>
      <h2 className={styles.heading}>このサービスでできること</h2>
      {CARDS.map(({ Icon, title, body, note }) => (
        <article key={title} className={styles.card}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <Icon size={14} />
            </span>
            <span className={styles.sectionLabel}>{title}</span>
          </div>
          <div className={styles.text}>
            <p className={styles.body}>{body}</p>
            {note && <p className={styles.note}>{note}</p>}
          </div>
        </article>
      ))}
    </>
  );
}
