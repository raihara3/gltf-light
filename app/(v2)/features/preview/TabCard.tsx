import type { IconProps } from "../../icons";
import styles from "./TabCard.module.scss";

interface TabCardProps {
  Icon: (props: IconProps) => React.ReactElement;
  title: string;
  children: React.ReactNode;
}

/** White card with a section title, shared by the preview context tabs. */
export function TabCard({ Icon, title, children }: TabCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          <Icon size={14} />
        </span>
        <span className={styles.sectionLabel}>{title}</span>
      </div>
      {children}
    </div>
  );
}
