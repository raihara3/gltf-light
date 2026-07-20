import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "./components/AppShell";
import "./styles/global.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "gltf-light",
  description: "オフラインでglbのプレビューと軽量化を",
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell fontClassName={inter.variable}>{children}</AppShell>;
}
