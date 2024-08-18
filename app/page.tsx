"use client";

// lib
import { RecoilRoot } from "recoil";

// style
import "./styles/global.scss";
import layoutStyles from "./styles/layouts.module.scss"
import commonStyles from "./styles/components/common.module.scss"

// components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Viewer from "./components/Viewer";

export default function Home() {
  return (
    <RecoilRoot>
      <Header />
      <main className={`${layoutStyles.layoutTwoColumn} ${commonStyles.border}`}>
        <div className={layoutStyles.layoutColumnLeft}>
          <Sidebar />
        </div>
        <div>
          <Viewer />
        </div>
      </main>
    </RecoilRoot>
  );
}
