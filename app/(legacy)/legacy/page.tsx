"use client";

// lib
import { Analytics } from "@vercel/analytics/react";

// components
import TwoColumn from "../layouts/TwoColumn";
import Header from "../components/Header";
import Sidebar from "../layouts/Sidebar";
import MainContent from "../layouts/MainContent";

export default function Home() {
  return (
    <>
      <Header />
      <TwoColumn
        className="box-border wrapper"
        left={<Sidebar />}
        right={<MainContent />}
      />
      <Analytics />
    </>
  );
}
