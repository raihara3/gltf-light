import { Fragment } from "react";
import Image from "next/image";

// style
import "./styles/global.scss";
import styles from "./styles/layouts.module.scss"

// components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <Fragment>
      <Header />
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
