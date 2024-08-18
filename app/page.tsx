import { Fragment } from "react";
import Image from "next/image";

// style
import "./styles/global.scss";
import styles from "./styles/layouts.module.scss"

// components
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <Fragment>
      <main className={styles.layoutTwoColumn}>
        <div className={styles.layoutColumnLeft}>
          <Sidebar />
        </div>
        <div>
          Uploader
        </div>
      </main>
    </Fragment>
  );
}
