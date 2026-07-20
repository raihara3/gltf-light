"use client";

// lib
import { RecoilRoot } from "recoil";

// style
import "./styles/global.scss";

export default function LegacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-app="legacy">
      <RecoilRoot>{children}</RecoilRoot>
    </div>
  );
}
