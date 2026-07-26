"use client";

import Link from "next/link";
import { useTranslations } from "../i18n/useTranslations";
import styles from "./LegacyLink.module.scss";

/**
 * Discreet link to the frozen legacy app (F-21). Sits at the bottom of the
 * sidebar, below the cards, so it never competes with the main flow.
 */
export function LegacyLink() {
  const t = useTranslations();
  return (
    <Link className={styles.link} href="/legacy">
      {t("legacy.open")}
    </Link>
  );
}
