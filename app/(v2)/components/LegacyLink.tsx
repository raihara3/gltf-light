import Link from "next/link";
import styles from "./LegacyLink.module.scss";

/**
 * Discreet link to the frozen legacy app (F-21). Sits at the bottom of the
 * sidebar, below the cards, so it never competes with the main flow.
 */
export function LegacyLink() {
  return (
    <Link className={styles.link} href="/legacy">
      以前のバージョンを開く
    </Link>
  );
}
