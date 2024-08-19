"use client";

// lib
import { RecoilRoot } from "recoil";

// style
import "./styles/global.scss";

// components
import TwoColumn from "./layouts/TwoColumn";
import Header from "./components/Header";
import Sidebar from "./layouts/Sidebar";
import MainContent from "./layouts/MainContent";

export default function Home() {
  return (
    <RecoilRoot>
      <Header />
      <TwoColumn
        className="box-border wrapper"
        left={<Sidebar />}
        right={<MainContent />}
      />
    </RecoilRoot>
  );
}
